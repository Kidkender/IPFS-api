/*
  Warnings:

  - You are about to drop the `Evidence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ipfs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Evidence] DROP CONSTRAINT [Evidence_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Ipfs] DROP CONSTRAINT [Ipfs_evidenceId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Transaction] DROP CONSTRAINT [Transaction_userId_fkey];

-- DropTable
DROP TABLE [dbo].[Evidence];

-- DropTable
DROP TABLE [dbo].[Ipfs];

-- DropTable
DROP TABLE [dbo].[Transaction];

-- DropTable
DROP TABLE [dbo].[User];

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000),
    [lastName] NVARCHAR(1000),
    [password] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[transactions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [from] NVARCHAR(1000) NOT NULL,
    [to] NVARCHAR(1000) NOT NULL,
    [amount] BIGINT NOT NULL,
    [userId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [transactions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [transactions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[evidences] (
    [id] INT NOT NULL IDENTITY(1,1),
    [status] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [evidences_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [evidences_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [evidences_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[ipfs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [folderCid] NVARCHAR(1000) NOT NULL,
    [linkIpfs] NVARCHAR(1000) NOT NULL,
    [evidenceId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ipfs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ipfs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ipfs_evidenceId_key] UNIQUE NONCLUSTERED ([evidenceId])
);

-- AddForeignKey
ALTER TABLE [dbo].[transactions] ADD CONSTRAINT [transactions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[evidences] ADD CONSTRAINT [evidences_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ipfs] ADD CONSTRAINT [ipfs_evidenceId_fkey] FOREIGN KEY ([evidenceId]) REFERENCES [dbo].[evidences]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
