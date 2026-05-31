-- CreateTable: thread de messages owner ↔ requester scopé à une CommunityRequest
CREATE TABLE "request_messages" (
    "id"         TEXT             NOT NULL,
    "requestId"  TEXT             NOT NULL,
    "fromUserId" TEXT             NOT NULL,
    "toUserId"   TEXT             NOT NULL,
    "content"    TEXT             NOT NULL,
    "isRead"     BOOLEAN          NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_messages_requestId_idx" ON "request_messages"("requestId");
CREATE INDEX "request_messages_toUserId_isRead_idx" ON "request_messages"("toUserId", "isRead");

-- AddForeignKey
ALTER TABLE "request_messages"
  ADD CONSTRAINT "request_messages_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "community_requests"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "request_messages"
  ADD CONSTRAINT "request_messages_fromUserId_fkey"
  FOREIGN KEY ("fromUserId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "request_messages"
  ADD CONSTRAINT "request_messages_toUserId_fkey"
  FOREIGN KEY ("toUserId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
