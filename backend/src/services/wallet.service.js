/**
 * Wallet Service
 * Handles financial operations for partners.
 */

/**
 * Credits a partner's wallet with the specified amount.
 * Must be called within a prisma transaction (tx).
 * 
 * @param {Object} tx - The Prisma transaction client
 * @param {string} partnerId - ID of the partner user
 * @param {number} amount - Amount to credit (positive)
 * @param {string} description - description for the transaction log
 * @param {string} referenceId - Optional reference ID (e.g. Booking ID)
 */
async function creditPartnerWallet(tx, partnerId, amount, description, referenceId = null) {
  if (!partnerId) return null;
  if (!amount || amount <= 0) return null;

  // 1. Find or create the wallet
  let wallet = await tx.wallet.findUnique({
    where: { userId: partnerId }
  });

  if (!wallet) {
    wallet = await tx.wallet.create({
      data: { 
        userId: partnerId,
        balance: 0,
        totalEarnings: 0
      }
    });
  }

  // 2. Update wallet balance and total earnings
  const updatedWallet = await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { increment: amount },
      totalEarnings: { increment: amount }
    }
  });

  // 3. Create a transaction record
  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount: amount,
      type: 'EARNING',
      description,
      referenceId: referenceId
    }
  });

  return updatedWallet;
}

module.exports = {
  creditPartnerWallet
};
