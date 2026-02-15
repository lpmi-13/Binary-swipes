import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../src/store/gameStore';
import { COLORS } from '../src/constants/theme';

export default function ResultsScreen() {
  const router = useRouter();
  const {
    phase,
    score,
    highScore,
    level,
    target,
    path,
    pathIndex,
    wasWrongSwipe,
    wasTimeout,
    nextLevel,
    restartLevel,
    goToMenu,
    initLevel,
  } = useGameStore();

  const isLevelComplete = phase === 'LEVEL_COMPLETE';
  const swipesCorrect = isLevelComplete ? path.length - 1 : pathIndex;

  const handleNextLevel = () => {
    nextLevel();
    router.replace('/game');
  };

  const handleRetry = () => {
    restartLevel();
    router.replace('/game');
  };

  const handleMenu = () => {
    goToMenu();
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.content}>
        {/* Outcome header */}
        <View style={styles.outcomeSection}>
          <Text style={[styles.outcomeEmoji]}>
            {isLevelComplete ? '✓' : '✗'}
          </Text>
          <Text
            style={[
              styles.outcomeTitle,
              { color: isLevelComplete ? COLORS.swipeRight : COLORS.swipeLeft },
            ]}
          >
            {isLevelComplete ? 'FOUND IT!' : wasTimeout ? 'TOO SLOW!' : 'WRONG WAY!'}
          </Text>

          {!isLevelComplete && (
            <Text style={styles.outcomeSubtitle}>
              Target was{' '}
              <Text style={styles.targetHighlight}>{target}</Text>
            </Text>
          )}
        </View>

        {/* Stats card */}
        <View style={styles.statsCard}>
          <StatRow label="LEVEL" value={String(level)} />
          <StatRow label="CORRECT SWIPES" value={String(swipesCorrect)} />
          <StatRow label="TOTAL SCORE" value={String(score)} highlight />
          {score >= highScore && score > 0 && (
            <Text style={styles.newHighScore}>NEW HIGH SCORE!</Text>
          )}
          {score < highScore && (
            <StatRow label="BEST" value={String(highScore)} />
          )}
        </View>

        {/* Path visualization */}
        <View style={styles.pathSection}>
          <Text style={styles.pathLabel}>YOUR PATH</Text>
          <View style={styles.pathRow}>
            {path.slice(0, pathIndex + 1).map((val, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <Text style={styles.pathArrow}>
                    {path[i] > path[i - 1] ? '▶' : '◀'}
                  </Text>
                )}
                <View
                  style={[
                    styles.pathNode,
                    i === pathIndex && isLevelComplete && styles.pathNodeTarget,
                    i === pathIndex && !isLevelComplete && styles.pathNodeWrong,
                  ]}
                >
                  <Text style={styles.pathNodeText}>{val}</Text>
                </View>
              </React.Fragment>
            ))}
            {!isLevelComplete && (
              <>
                <Text style={styles.pathArrow}>?</Text>
                <View style={[styles.pathNode, styles.pathNodeMissed]}>
                  <Text style={styles.pathNodeText}>{target}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {isLevelComplete && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNextLevel} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>NEXT LEVEL</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>
              {isLevelComplete ? 'RETRY LEVEL' : 'TRY AGAIN'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={handleMenu} activeOpacity={0.8}>
            <Text style={styles.ghostButtonText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  outcomeSection: {
    alignItems: 'center',
    gap: 6,
  },
  outcomeEmoji: {
    fontSize: 56,
    lineHeight: 68,
  },
  outcomeTitle: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
  },
  outcomeSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  targetHighlight: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: 'rgba(30,58,95,0.3)',
    borderColor: COLORS.nodeDefaultBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  statValueHighlight: {
    color: COLORS.gold,
    fontSize: 26,
  },
  newHighScore: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 4,
  },
  pathSection: {
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  pathLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  pathRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pathArrow: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginHorizontal: 2,
  },
  pathNode: {
    backgroundColor: COLORS.nodeDefault,
    borderColor: COLORS.nodeDefaultBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  pathNodeTarget: {
    backgroundColor: COLORS.nodeCorrect,
    borderColor: COLORS.nodeCorrectBorder,
  },
  pathNodeWrong: {
    backgroundColor: COLORS.nodeWrong,
    borderColor: COLORS.nodeWrongBorder,
  },
  pathNodeMissed: {
    backgroundColor: COLORS.nodeTarget,
    borderColor: COLORS.nodeTargetBorder,
  },
  pathNodeText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.nodeCurrent,
    borderColor: COLORS.nodeCurrentBorder,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.nodeDefaultBorder,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
  },
  ghostButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    letterSpacing: 1.5,
  },
});
