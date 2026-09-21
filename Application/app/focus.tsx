import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen, Card } from '../components/Screen';
import { colors } from '../theme';
import { getSessions, Session, saveSession } from '../data/store';

export default function Focus() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const [session, setSession] = useState<Session | null>(null);
  const [minutesInput, setMinutesInput] = useState('25');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  const fromLedger = Boolean(sessionId);

  useEffect(() => {
    getSessions().then((xs) => {
      const found = sessionId
        ? xs.find((x) => x.id === sessionId) || null
        : null;

      setSession(found);

      if (found) {
        setMinutesInput(String(found.minutes));
        setSeconds(found.minutes * 60);
        setStarted(true);
      }
    });
  }, [sessionId]);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          clearInterval(id);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  const display = useMemo(
    () =>
      `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
        seconds % 60,
      ).padStart(2, '0')}`,
    [seconds],
  );

  const startStandaloneFocus = () => {
    const parsed = Math.max(1, Math.min(240, Number(minutesInput) || 25));
    setMinutesInput(String(parsed));
    setSeconds(parsed * 60);
    setStarted(true);
    setRunning(true);
  };

  const toggleRunning = () => {
    if (seconds === 0) return;
    setStarted(true);
    setRunning((value) => !value);
  };

  const reset = () => {
    const parsed = Math.max(
      1,
      Math.min(240, Number(minutesInput) || session?.minutes || 25),
    );
    setMinutesInput(String(parsed));
    setSeconds(parsed * 60);
    setRunning(false);
  };

  const finish = async () => {
    setRunning(false);

    if (session) {
      await saveSession({
        ...session,
        status: 'completed',
        cycles: Math.max(session.cycles, session.cycles + 1),
      });
    }

    router.push('/diary');
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <MaterialIcons name="arrow-back" size={20} color={colors.ink} />
        <Text>Back</Text>
      </Pressable>

      <Text style={styles.kicker}>FOCUS CANVAS</Text>

      {fromLedger && session ? (
        <>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.subtitle}>{session.subject}</Text>

          <Card>
            <View style={styles.ring}>
              <Text style={styles.timer}>{display}</Text>
              <Text style={styles.rem}>remaining</Text>
            </View>

            <View style={styles.row}>
              <Pressable style={styles.primary} onPress={toggleRunning}>
                <MaterialIcons
                  name={running ? 'pause' : 'play-arrow'}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.primaryText}>
                  {running ? 'Pause' : 'Start Focus'}
                </Text>
              </Pressable>

              <Pressable style={styles.secondary} onPress={reset}>
                <Text>Reset</Text>
              </Pressable>
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Session intention</Text>
            <Text style={styles.body}>
              Continue the active session selected from the Study Ledger.
              Keep distractions aside until the block is complete.
            </Text>
          </Card>

          <Pressable onPress={finish}>
            <Text style={styles.finish}>Finish Session</Text>
          </Pressable>
        </>
      ) : !started ? (
        <>
          <Text style={styles.title}>Start a focus session</Text>
          <Text style={styles.subtitle}>
            Choose how long you want to work, then begin.
          </Text>

          <Card>
            <Text style={styles.cardTitle}>Focus duration</Text>

            <View style={styles.inputRow}>
              <TextInput
                value={minutesInput}
                onChangeText={setMinutesInput}
                keyboardType="number-pad"
                maxLength={3}
                style={styles.input}
              />
              <Text style={styles.minutesLabel}>minutes</Text>
            </View>

            <Pressable style={styles.primaryWide} onPress={startStandaloneFocus}>
              <MaterialIcons name="play-arrow" size={24} color="#fff" />
              <Text style={styles.primaryText}>Start Focus</Text>
            </Pressable>
          </Card>
        </>
      ) : (
        <>
          <Text style={styles.kicker}>ACTIVE FOCUS</Text>
          <Text style={styles.title}>Deep work</Text>
          <Text style={styles.subtitle}>
            Your standalone focus session is running.
          </Text>

          <Card>
            <View style={styles.ring}>
              <Text style={styles.timer}>{display}</Text>
              <Text style={styles.rem}>remaining</Text>
            </View>

            <View style={styles.row}>
              <Pressable style={styles.primary} onPress={toggleRunning}>
                <MaterialIcons
                  name={running ? 'pause' : 'play-arrow'}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.primaryText}>
                  {running ? 'Pause' : 'Resume'}
                </Text>
              </Pressable>

              <Pressable style={styles.secondary} onPress={reset}>
                <Text>Reset</Text>
              </Pressable>
            </View>
          </Card>

          <Pressable onPress={() => router.push('/diary')}>
            <Text style={styles.finish}>Finish Session</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.brass,
    fontWeight: '700',
  },
  title: {
    fontSize: 34,
    color: colors.ink,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
  },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: colors.brass,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surfaceLow,
  },
  timer: {
    fontSize: 46,
    fontWeight: '500',
  },
  rem: {
    fontSize: 12,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 24,
  },
  primary: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    backgroundColor: colors.ink,
    padding: 14,
    borderRadius: 999,
  },
  primaryWide: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    padding: 14,
    borderRadius: 999,
    marginTop: 18,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondary: {
    padding: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  input: {
    width: 100,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLow,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 24,
    textAlign: 'center',
    color: colors.ink,
  },
  minutesLabel: {
    fontSize: 16,
    color: colors.muted,
  },
  finish: {
    alignSelf: 'center',
    color: colors.brass,
    fontWeight: '700',
  },
});
