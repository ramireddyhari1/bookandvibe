import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ActivityIndicator, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import { X, Trophy, Plus, Minus, Check, Save, Loader2, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiPost, apiPatch } from '../lib/api';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LiveMatchScorerProps {
  bookingId: string;
  sportType: string;
  onClose: () => void;
}

const LiveMatchScorer: React.FC<LiveMatchScorerProps> = ({ bookingId, sportType, onClose }) => {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize or get match
    const initMatch = async () => {
      try {
        const data = await apiPost<any>('/live-match', { bookingId, sportType });
        setMatch(data);
        setScoreData(data.scoreData || {});
      } catch (err) {
        console.error('Failed to init match:', err);
        Alert.alert('Error', 'Could not initialize match scoring.');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    initMatch();
  }, [bookingId, sportType]);

  const updateScore = async (newData: any) => {
    if (!match) return;
    setSaving(true);
    try {
      const updated = await apiPatch<any>(`/live-match/${match.id}`, { scoreData: newData });
      setScoreData(updated.scoreData);
    } catch (err) {
      console.error('Failed to update score:', err);
    } finally {
      setSaving(false);
    }
  };

  const addRuns = (runs: number) => {
    const newData = { ...scoreData, runs: (scoreData.runs || 0) + runs };
    // Increment balls/overs logic for cricket
    let balls = (scoreData.balls || 0) + 1;
    let overs = scoreData.overs || 0;
    if (balls >= 6) {
      overs += 1;
      balls = 0;
    }
    updateScore({ ...newData, balls, overs });
  };

  if (loading) {
    return (
      <View style={styles.fullScreenLoading}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Modal animationType="slide" transparent={false} visible={true} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconCircle}>
              <Trophy size={20} color="#FFF" />
            </View>
            <View>
              <Text style={styles.title}>Live Match Scorer</Text>
              <Text style={styles.subtitle}>{sportType.toUpperCase()}</Text>
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#64748B" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Score Card */}
          <View style={styles.scoreCardContainer}>
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              style={styles.scoreCard}
            >
              <Text style={styles.scoreLabel}>CURRENT SCORE</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreRuns}>{scoreData.runs || 0}</Text>
                <Text style={styles.scoreSlash}>/</Text>
                <Text style={styles.scoreWickets}>{scoreData.wickets || 0}</Text>
              </View>
              <View style={styles.oversBadge}>
                <Text style={styles.oversText}>Overs: {scoreData.overs || 0}.{scoreData.balls || 0}</Text>
              </View>

              {saving && (
                <View style={styles.syncingRow}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={styles.syncingText}>SYNCING</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Quick Controls */}
          <View style={styles.controlsGrid}>
            {[0, 1, 2, 3, 4, 6].map(runs => (
              <Pressable 
                key={runs} 
                onPress={() => addRuns(runs)}
                disabled={saving}
                style={({ pressed }) => [
                  styles.controlBtn,
                  pressed && styles.controlBtnPressed
                ]}
              >
                <Text style={styles.controlBtnVal}>{runs}</Text>
                <Text style={styles.controlBtnLabel}>RUNS</Text>
              </Pressable>
            ))}
            <Pressable 
              onPress={() => updateScore({ ...scoreData, wickets: (scoreData.wickets || 0) + 1 })}
              disabled={saving}
              style={({ pressed }) => [
                styles.wicketBtn,
                pressed && styles.wicketBtnPressed
              ]}
            >
              <Text style={styles.wicketBtnVal}>W</Text>
              <Text style={styles.wicketBtnLabel}>WICKET</Text>
            </Pressable>
          </View>

          {/* Manual Adjustments */}
          <View style={styles.adjustmentsContainer}>
            <Text style={styles.sectionLabel}>MANUAL ADJUSTMENTS</Text>
            <View style={styles.adjustmentsRow}>
              <Pressable 
                onPress={() => updateScore({ ...scoreData, runs: (scoreData.runs || 0) - 1 })}
                style={styles.adjBtn}
              >
                <Text style={styles.adjBtnText}>-1 RUN</Text>
              </Pressable>
              <Pressable 
                onPress={() => updateScore({ ...scoreData, wickets: (scoreData.wickets || 0) - 1 })}
                style={styles.adjBtn}
              >
                <Text style={styles.adjBtnText}>-1 WICKET</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable 
            onPress={() => {
              Alert.alert(
                'Finish Match',
                'Are you sure you want to end this match scoring? This will move it to history.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Finish', 
                    style: 'destructive',
                    onPress: async () => {
                      await updateScore({ ...scoreData, status: 'FINISHED' });
                      onClose();
                    }
                  }
                ]
              );
            }}
            style={styles.finishBtn}
          >
            <Text style={styles.finishBtnText}>FINISH MATCH</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>CLOSE SCORER</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenLoading: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: typography.bold,
    color: '#64748B',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scoreCardContainer: {
    marginBottom: 32,
  },
  scoreCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: '#10B981',
    letterSpacing: 2,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreRuns: {
    fontSize: 72,
    fontFamily: typography.bold,
    color: '#FFFFFF',
  },
  scoreSlash: {
    fontSize: 42,
    fontFamily: typography.bold,
    color: '#475569',
    marginHorizontal: 8,
  },
  scoreWickets: {
    fontSize: 56,
    fontFamily: typography.bold,
    color: '#FFFFFF',
  },
  oversBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 16,
  },
  oversText: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: '#FFFFFF',
  },
  syncingRow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncingText: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: '#10B981',
    letterSpacing: 1,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  controlBtn: {
    width: (SCREEN_WIDTH - 64) / 3,
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnPressed: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  controlBtnVal: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  controlBtnLabel: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  wicketBtn: {
    width: (SCREEN_WIDTH - 64) / 3,
    aspectRatio: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wicketBtnPressed: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  wicketBtnVal: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: '#EF4444',
  },
  wicketBtnLabel: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: '#F87171',
    letterSpacing: 0.5,
  },
  adjustmentsContainer: {
    marginTop: 32,
    marginBottom: 40,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: typography.bold,
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 16,
  },
  adjustmentsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  adjBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  adjBtnText: {
    fontSize: 13,
    fontFamily: typography.bold,
    color: '#475569',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  finishBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnText: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: typography.bold,
    color: '#94A3B8',
  },
});

export default LiveMatchScorer;
