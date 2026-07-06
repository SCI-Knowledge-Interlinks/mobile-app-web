const { pool } = require("../config/database");

function mapConversationRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    type: row.type,
    eventId: row.event_id != null ? Number(row.event_id) : null,
    lastMessage: row.last_message_body
      ? {
          body: row.last_message_body,
          createdAt: row.last_message_at,
          senderUserId: row.last_sender_user_id != null ? Number(row.last_sender_user_id) : null,
        }
      : null,
    unreadCount: Number(row.unread_count || 0),
    updatedAt: row.updated_at,
  };
}

function mapMessageRow(row) {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderUserId: row.sender_user_id != null ? Number(row.sender_user_id) : null,
    senderName: row.sender_name || "Support",
    body: row.body,
    createdAt: row.created_at,
  };
}

async function ensureSupportConversation(userId, eventId = 1) {
  const [existing] = await pool.query(
    `
      SELECT c.id
      FROM chat_conversations c
      INNER JOIN chat_participants p ON p.conversation_id = c.id
      WHERE c.type = 'support' AND p.user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  if (existing.length) {
    return existing[0].id;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [conversationResult] = await connection.query(
      `
        INSERT INTO chat_conversations (title, type, event_id)
        VALUES ('Event Support', 'support', ?)
      `,
      [eventId]
    );

    const conversationId = conversationResult.insertId;

    await connection.query(
      `
        INSERT INTO chat_participants (conversation_id, user_id)
        VALUES (?, ?)
      `,
      [conversationId, userId]
    );

    await connection.query(
      `
        INSERT INTO chat_messages (conversation_id, sender_user_id, sender_name, body)
        VALUES (?, NULL, 'Event Support', ?)
      `,
      [
        conversationId,
        "Welcome to Prawaas chat. Ask us anything about the event, your badge, or sessions.",
      ]
    );

    await connection.commit();
    return conversationId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listConversationsForUser(userId) {
  await ensureSupportConversation(userId);

  const [rows] = await pool.query(
    `
      SELECT
        c.id,
        c.title,
        c.type,
        c.event_id,
        c.updated_at,
        lm.body AS last_message_body,
        lm.created_at AS last_message_at,
        lm.sender_user_id AS last_sender_user_id,
        (
          SELECT COUNT(*)
          FROM chat_messages m
          LEFT JOIN chat_participants p
            ON p.conversation_id = c.id AND p.user_id = ?
          WHERE m.conversation_id = c.id
            AND m.sender_user_id IS NOT NULL
            AND m.sender_user_id <> ?
            AND (p.last_read_at IS NULL OR m.created_at > p.last_read_at)
        ) AS unread_count
      FROM chat_conversations c
      INNER JOIN chat_participants cp ON cp.conversation_id = c.id AND cp.user_id = ?
      LEFT JOIN chat_messages lm ON lm.id = (
        SELECT m2.id
        FROM chat_messages m2
        WHERE m2.conversation_id = c.id
        ORDER BY m2.created_at DESC, m2.id DESC
        LIMIT 1
      )
      ORDER BY COALESCE(lm.created_at, c.updated_at) DESC, c.id DESC
    `,
    [userId, userId, userId]
  );

  return rows.map(mapConversationRow);
}

async function userInConversation(userId, conversationId) {
  const [rows] = await pool.query(
    `
      SELECT id
      FROM chat_participants
      WHERE conversation_id = ? AND user_id = ?
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return rows.length > 0;
}

async function getConversationById(conversationId, userId) {
  const [rows] = await pool.query(
    `
      SELECT c.id, c.title, c.type, c.event_id, c.updated_at
      FROM chat_conversations c
      INNER JOIN chat_participants p ON p.conversation_id = c.id AND p.user_id = ?
      WHERE c.id = ?
      LIMIT 1
    `,
    [userId, conversationId]
  );

  if (!rows.length) {
    return null;
  }

  const row = rows[0];
  return {
    id: String(row.id),
    title: row.title,
    type: row.type,
    eventId: row.event_id != null ? Number(row.event_id) : null,
    updatedAt: row.updated_at,
  };
}

async function listMessages(conversationId, userId, { limit = 50, beforeId = null } = {}) {
  const allowed = await userInConversation(userId, conversationId);
  if (!allowed) {
    return null;
  }

  const params = [conversationId];
  let beforeClause = "";

  if (beforeId) {
    beforeClause = "AND m.id < ?";
    params.push(beforeId);
  }

  params.push(limit);

  const [rows] = await pool.query(
    `
      SELECT m.id, m.conversation_id, m.sender_user_id, m.sender_name, m.body, m.created_at
      FROM chat_messages m
      WHERE m.conversation_id = ?
      ${beforeClause}
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ?
    `,
    params
  );

  return rows.reverse().map(mapMessageRow);
}

async function createDirectConversation(userId, { title, eventId = 1, metadata = null }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [conversationResult] = await connection.query(
      `
        INSERT INTO chat_conversations (title, type, event_id, metadata)
        VALUES (?, 'direct', ?, ?)
      `,
      [title, eventId, metadata ? JSON.stringify(metadata) : null]
    );

    const conversationId = conversationResult.insertId;

    await connection.query(
      `
        INSERT INTO chat_participants (conversation_id, user_id)
        VALUES (?, ?)
      `,
      [conversationId, userId]
    );

    await connection.commit();
    return conversationId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findDirectConversationByMetadata(userId, metadataKey, metadataValue) {
  const [rows] = await pool.query(
    `
      SELECT c.id
      FROM chat_conversations c
      INNER JOIN chat_participants p ON p.conversation_id = c.id AND p.user_id = ?
      WHERE c.type = 'direct'
        AND JSON_UNQUOTE(JSON_EXTRACT(c.metadata, ?)) = ?
      LIMIT 1
    `,
    [userId, `$.${metadataKey}`, String(metadataValue)]
  );

  return rows[0]?.id || null;
}

async function insertMessage({ conversationId, senderUserId, senderName, body }) {
  const [result] = await pool.query(
    `
      INSERT INTO chat_messages (conversation_id, sender_user_id, sender_name, body)
      VALUES (?, ?, ?, ?)
    `,
    [conversationId, senderUserId, senderName, body]
  );

  await pool.query(
    `
      UPDATE chat_conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [conversationId]
  );

  const [rows] = await pool.query(
    `
      SELECT id, conversation_id, sender_user_id, sender_name, body, created_at
      FROM chat_messages
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return mapMessageRow(rows[0]);
}

async function markConversationRead(conversationId, userId) {
  await pool.query(
    `
      UPDATE chat_participants
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND user_id = ?
    `,
    [conversationId, userId]
  );
}

module.exports = {
  ensureSupportConversation,
  listConversationsForUser,
  getConversationById,
  listMessages,
  createDirectConversation,
  findDirectConversationByMetadata,
  insertMessage,
  markConversationRead,
  userInConversation,
};
