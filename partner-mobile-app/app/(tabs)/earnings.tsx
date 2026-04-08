import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { COLORS } from '../../src/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, History, Download, ArrowRight, Building2, Landmark, CheckCircle2 } from 'lucide-react-native';
import apiClient from '../../src/api/client';

export default function EarningsScreen() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchWallet() {
    try {
      const response = await apiClient.get('/partners/wallet');
      setWallet(response.data.data);
    } catch (error) {
      console.error('Failed to fetch wallet', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  async function handleWithdraw() {
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountNum > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/partners/payouts', {
        amount: amountNum,
        bankDetails: {
          accountName: 'Partner Business Name',
          accountNumber: '••••••••4567',
          bankName: 'HDFC Bank',
          ifsc: 'HDFC0001234'
        }
      });
      Alert.alert('Success', 'Withdrawal request submitted successfully');
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
      fetchWallet();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Download size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.totalRevenueCard}>
          <View style={styles.revenueHeader}>
            <TrendingUp size={24} color={COLORS.primary} />
            <View style={styles.revenueBadge}>
              <Text style={styles.revenueBadgeText}>+12.5% this month</Text>
            </View>
          </View>
          <Text style={styles.revenueLabel}>Total Lifetime Revenue</Text>
          <Text style={styles.revenueValue}>₹{(wallet?.totalEarnings || 0).toLocaleString()}</Text>
          <View style={styles.revenueChartPlaceholder}>
            {/* Visual chart bars */}
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <View key={i} style={[styles.chartBar, { height: h, opacity: i === 5 ? 1 : 0.3 }]} />
            ))}
          </View>
        </View>

        <View style={styles.walletBox}>
          <View style={styles.walletInfo}>
            <View style={styles.walletIconBg}>
              <Wallet size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.walletBoxLabel}>Current Balance</Text>
              <Text style={styles.walletBoxValue}>₹{(wallet?.balance || 0).toLocaleString()}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.withdrawBtn}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <Text style={styles.withdrawBtnText}>WITHDRAW</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactional history</Text>
            <History size={16} color={COLORS.textMuted} />
          </View>

          <View style={styles.historyList}>
            {wallet?.transactions?.length > 0 ? (
              wallet.transactions.map((tx: any) => (
                <View key={tx.id} style={styles.historyItem}>
                  <View style={[styles.historyIndicator, { backgroundColor: tx.amount > 0 ? COLORS.success : COLORS.danger }]} />
                  <View style={styles.historyMain}>
                    <Text style={styles.historyTitle}>{tx.description || 'Transaction'}</Text>
                    <Text style={styles.historyDate}>{new Date(tx.createdAt).toLocaleDateString()} • {tx.type}</Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: tx.amount > 0 ? COLORS.success : COLORS.danger }]}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No transaction history</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Payout</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Text style={styles.closeBtnText}>CLOSE</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount to Withdraw</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textMuted}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    autoFocus
                  />
                </View>
                <Text style={styles.balanceInfo}>Available: ₹{wallet?.balance.toLocaleString()}</Text>
              </View>

              <View style={styles.bankPreview}>
                <Text style={styles.bankPreviewHeader}>Destination Account</Text>
                <View style={styles.bankItem}>
                  <Landmark size={20} color={COLORS.primary} />
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>HDFC Bank</Text>
                    <Text style={styles.accountNumber}>••••••••4567</Text>
                  </View>
                  <CheckCircle2 size={16} color={COLORS.primary} />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.confirmBtn, submitting && styles.disabledBtn]} 
                onPress={handleWithdraw}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.text} />
                ) : (
                  <>
                    <Text style={styles.confirmBtnText}>CONFIRM WITHDRAWAL</Text>
                    <ArrowRight size={20} color={COLORS.text} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalRevenueCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  revenueBadge: {
    backgroundColor: COLORS.primary + '30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  revenueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  revenueLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: 24,
  },
  revenueChartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
  },
  chartBar: {
    width: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  walletBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walletIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  walletBoxValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  withdrawBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  withdrawBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 16,
  },
  historyMain: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  modalBody: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 24,
    height: 80,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
  },
  balanceInfo: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  bankPreview: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  bankPreviewHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  accountNumber: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: 20,
    gap: 12,
    marginTop: 12,
  },
  confirmBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  disabledBtn: {
    opacity: 0.5,
  }
});
