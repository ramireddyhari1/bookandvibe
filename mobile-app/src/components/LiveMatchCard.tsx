import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../theme/typography';

interface LiveMatchCardProps {
  match: {
    id: string;
    sportType: string;
    scoreData: any;
    booking: {
      user: {
        name: string;
      };
    };
  };
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match }) => {
  const { scoreData, sportType, booking } = match;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.sportBadge}>
          <View style={styles.iconCircle}>
            <Trophy size={14} color="#059669" />
          </View>
          <Text style={styles.sportText}>LIVE {sportType.toUpperCase()}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        {sportType.toUpperCase() === 'CRICKET' ? (
          <>
            <View style={styles.runsRow}>
              <Text style={styles.runsText}>{scoreData.runs || 0}</Text>
              <Text style={styles.slash}>/</Text>
              <Text style={styles.wicketsText}>{scoreData.wickets || 0}</Text>
            </View>
            <View style={styles.oversBadge}>
              <Text style={styles.oversText}>Overs: {scoreData.overs || 0}.{scoreData.balls || 0}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.runsText}>{scoreData.points || 0}</Text>
            <View style={styles.oversBadge}>
              <Text style={styles.oversText}>Points Scored</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{booking.user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName} numberOfLines={1}>{booking.user.name}</Text>
        </View>
        <View style={styles.timeRow}>
          <Clock size={12} color="#94A3B8" />
          <Text style={styles.timeText}>ACTIVE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#ECFDF5',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportText: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: '#059669',
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: '#EF4444',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  runsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  runsText: {
    fontSize: 42,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  slash: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  wicketsText: {
    fontSize: 32,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  oversBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  oversText: {
    fontSize: 12,
    fontFamily: typography.bold,
    color: '#64748B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: '#64748B',
  },
  userName: {
    fontSize: 12,
    fontFamily: typography.bold,
    color: '#475569',
    maxWidth: 100,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
});

export default LiveMatchCard;
