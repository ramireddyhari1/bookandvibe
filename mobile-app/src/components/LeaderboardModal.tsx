import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, ActivityIndicator, Image } from 'react-native';
import { X, Award, Trophy, Medal, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet } from '../lib/api';
import { typography } from '../theme/typography';

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ visible, onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchLeaderboard();
    }
  }, [visible]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const result = await apiGet<any[]>('/live-match/leaderboard');
      setData(result);
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isTop3 = index < 3;
    const colors = ['#F59E0B', '#94A3B8', '#D97706']; // Gold, Silver, Bronze

    return (
      <View style={styles.rankRow}>
        <View style={styles.rankLeft}>
          <View style={[styles.rankNumber, isTop3 && { backgroundColor: colors[index] }]}>
            {isTop3 ? (
              <Medal size={14} color="#FFF" />
            ) : (
              <Text style={styles.rankText}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userMeta}>{item.matchesPlayed} Matches played</Text>
          </View>
        </View>
        <View style={styles.rankRight}>
          <Text style={styles.scoreVal}>{item.totalRuns}</Text>
          <Text style={styles.scoreLabel}>RUNS</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Global Leaderboard</Text>
              <Text style={styles.subtitle}>TOP PERFORMERS • CRICKET</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#64748B" />
            </Pressable>
          </View>

          <View style={styles.heroSection}>
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View>
                  <Text style={styles.heroLabel}>COMMUNITY TOTAL</Text>
                  <Text style={styles.heroValue}>Elite Tier</Text>
                </View>
                <TrendingUp size={32} color="#10B981" />
              </View>
            </LinearGradient>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#10B981" />
            </View>
          ) : (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Award size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No rankings available yet.</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    fontFamily: typography.bold,
    color: '#10B981',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  heroValue: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: '#FFFFFF',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontFamily: typography.bold,
    color: '#64748B',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  userMeta: {
    fontSize: 12,
    fontFamily: typography.primary,
    color: '#94A3B8',
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  scoreVal: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.primary,
    color: '#94A3B8',
  },
});

export default LeaderboardModal;
