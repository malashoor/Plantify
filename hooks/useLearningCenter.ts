import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase/supabase';
import {
  LearningModule,
  Lesson,
  LearningCenterState,
  UserProgress,
  Quiz,
  QuizAttempt,
  QuizAnswer,
  QuizQuestion,
  Bookmark,
  LearningGoal,
  Achievement,
  PracticeLink,
  VoiceSegment,
  LEARNING_MODULES,
  SAMPLE_LESSONS,
} from '../types/learn';
import { useI18n } from './useI18n';
import { router } from 'expo-router';

const STORAGE_KEYS = {
  USER_PROGRESS: '@learning_center_progress',
  BOOKMARKS: '@learning_center_bookmarks',
  ACHIEVEMENTS: '@learning_center_achievements',
  LEARNING_GOALS: '@learning_center_goals',
  USER_PREFERENCES: '@learning_center_preferences',
  DOWNLOADED_CONTENT: '@learning_center_offline',
  VOICE_SETTINGS: '@learning_center_voice',
};

export const useLearningCenter = () => {
  const { t, locale } = useI18n();
  const [state, setState] = useState<LearningCenterState>({
    modules: LEARNING_MODULES,
    currentModule: null,
    currentLesson: null,
    userProgress: [],
    bookmarks: [],
    achievements: [],
    learningGoals: [],
    isLoading: false,
    error: null,
    // Voice and playback settings
    isVoiceEnabled: true,
    voiceSpeed: 1.0,
    autoAdvance: false,
    // User preferences
    preferredDifficulty: 'beginner',
    studyReminders: true,
    dailyGoalMinutes: 30,
    // Offline support
    isOffline: false,
    downloadedContent: [],
    syncStatus: 'synced',
    // Learning analytics
    totalStudyTime: 0,
    currentStreak: 0,
    weeklyGoalProgress: 0,
  });

  const isInitialized = useRef(false);
  const currentVoiceRef = useRef<string | null>(null);
  const studySessionStartTime = useRef<Date | null>(null);

  // Initialize learning center
  useEffect(() => {
    if (!isInitialized.current) {
      initializeLearningCenter();
      setupNetworkListener();
      setupNotifications();
      isInitialized.current = true;
    }
  }, []);

  // Track study session time
  useEffect(() => {
    if (state.currentLesson && !studySessionStartTime.current) {
      studySessionStartTime.current = new Date();
    }

    return () => {
      if (studySessionStartTime.current) {
        const sessionTime = Date.now() - studySessionStartTime.current.getTime();
        updateStudyTime(Math.floor(sessionTime / 1000));
        studySessionStartTime.current = null;
      }
    };
  }, [state.currentLesson]);

  // Initialize learning center
  const initializeLearningCenter = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Load user data from AsyncStorage
      const [userProgress, bookmarks, achievements, learningGoals, preferences, downloadedContent] =
        await Promise.all([
          loadUserProgress(),
          loadBookmarks(),
          loadAchievements(),
          loadLearningGoals(),
          loadUserPreferences(),
          loadDownloadedContent(),
        ]);

      // Calculate learning analytics
      const analytics = calculateLearningAnalytics(userProgress);

      setState(prev => ({
        ...prev,
        userProgress,
        bookmarks,
        achievements,
        learningGoals,
        downloadedContent,
        ...preferences,
        ...analytics,
        isLoading: false,
      }));

      // Sync with Supabase if online
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected) {
        await syncWithSupabase();
      }
    } catch (error) {
      console.error('Failed to initialize learning center:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load learning data',
        isLoading: false,
      }));
    }
  }, []);

  // Setup network listener
  const setupNetworkListener = useCallback(() => {
    const unsubscribe = NetInfo.addEventListener(networkState => {
      setState(prev => ({
        ...prev,
        isOffline: !networkState.isConnected,
      }));

      // Auto-sync when coming back online
      if (networkState.isConnected && prev.isOffline) {
        syncWithSupabase();
      }
    });

    return unsubscribe;
  }, []);

  // Setup study reminder notifications
  const setupNotifications = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        // Schedule daily study reminder
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t('learn.notifications.studyReminder.title'),
            body: t('learn.notifications.studyReminder.body'),
            sound: true,
          },
          trigger: {
            hour: 19, // 7 PM
            minute: 0,
            repeats: true,
          },
        });
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  }, [t]);

  // Load user progress from storage
  const loadUserProgress = useCallback(async (): Promise<UserProgress[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (data) {
        const progress = JSON.parse(data);
        // Convert date strings back to Date objects
        return progress.map((p: any) => ({
          ...p,
          lastAccessedAt: new Date(p.lastAccessedAt),
          lastModified: new Date(p.lastModified),
          quizAttempts: p.quizAttempts.map((attempt: any) => ({
            ...attempt,
            completedAt: new Date(attempt.completedAt),
          })),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load user progress:', error);
      return [];
    }
  }, []);

  // Load bookmarks
  const loadBookmarks = useCallback(async (): Promise<Bookmark[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) {
        const bookmarks = JSON.parse(data);
        return bookmarks.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      return [];
    }
  }, []);

  // Load achievements
  const loadAchievements = useCallback(async (): Promise<Achievement[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        const achievements = JSON.parse(data);
        return achievements.map((a: any) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  }, []);

  // Load learning goals
  const loadLearningGoals = useCallback(async (): Promise<LearningGoal[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_GOALS);
      if (data) {
        const goals = JSON.parse(data);
        return goals.map((g: any) => ({
          ...g,
          targetDate: new Date(g.targetDate),
          createdAt: new Date(g.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load learning goals:', error);
      return [];
    }
  }, []);

  // Load user preferences
  const loadUserPreferences = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {};
    }
  }, []);

  // Load downloaded content
  const loadDownloadedContent = useCallback(async (): Promise<string[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOADED_CONTENT);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load downloaded content:', error);
      return [];
    }
  }, []);

  // Calculate learning analytics
  const calculateLearningAnalytics = useCallback((userProgress: UserProgress[]) => {
    const totalStudyTime = userProgress.reduce((sum, p) => sum + p.totalStudyTime, 0);

    // Calculate current streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dayProgress = userProgress.find(p => {
        const progressDate = new Date(p.lastAccessedAt);
        const progressDay = new Date(
          progressDate.getFullYear(),
          progressDate.getMonth(),
          progressDate.getDate()
        );
        return progressDay.getTime() === checkDate.getTime();
      });

      if (dayProgress && dayProgress.timeSpent > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate weekly goal progress
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weeklyTime = userProgress
      .filter(p => new Date(p.lastAccessedAt) >= weekStart)
      .reduce((sum, p) => sum + p.timeSpent, 0);
    const weeklyGoalProgress = Math.min(100, (weeklyTime / (7 * 30 * 60)) * 100); // 30 min daily goal

    return {
      totalStudyTime,
      currentStreak,
      weeklyGoalProgress,
    };
  }, []);

  // Sync with Supabase
  const syncWithSupabase = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }));

      // Sync user progress
      for (const progress of state.userProgress) {
        if (progress.syncStatus === 'pending') {
          await saveProgressToSupabase(progress);
        }
      }

      // Sync bookmarks
      for (const bookmark of state.bookmarks) {
        await saveBookmarkToSupabase(bookmark);
      }

      setState(prev => ({ ...prev, syncStatus: 'synced' }));
    } catch (error) {
      console.error('Sync failed:', error);
      setState(prev => ({ ...prev, syncStatus: 'failed' }));
    }
  }, [state.userProgress, state.bookmarks]);

  // Save progress to Supabase
  const saveProgressToSupabase = useCallback(async (progress: UserProgress) => {
    try {
      const { error } = await supabase.from('learning_progress').upsert({
        id: progress.id,
        user_id: progress.userId,
        module_id: progress.moduleId,
        lesson_id: progress.lessonId,
        status: progress.status,
        completion_percentage: progress.completionPercentage,
        time_spent: progress.timeSpent,
        last_accessed_at: progress.lastAccessedAt.toISOString(),
        bookmarked: progress.bookmarked,
        notes: progress.notes,
        best_quiz_score: progress.bestQuizScore,
        study_streak: progress.studyStreak,
        total_study_time: progress.totalStudyTime,
        weak_areas: progress.weakAreas,
        strong_areas: progress.strongAreas,
        last_modified: progress.lastModified.toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save progress to Supabase:', error);
    }
  }, []);

  // Save bookmark to Supabase
  const saveBookmarkToSupabase = useCallback(async (bookmark: Bookmark) => {
    try {
      const { error } = await supabase.from('learning_bookmarks').upsert({
        id: bookmark.id,
        user_id: bookmark.userId,
        lesson_id: bookmark.lessonId,
        section_id: bookmark.sectionId,
        title: bookmark.title,
        description: bookmark.description,
        timestamp: bookmark.timestamp,
        notes: bookmark.notes,
        tags: bookmark.tags,
        created_at: bookmark.createdAt.toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save bookmark to Supabase:', error);
    }
  }, []);

  // Start learning module
  const startModule = useCallback(
    async (module: LearningModule) => {
      setState(prev => ({ ...prev, currentModule: module }));

      // Check if module is unlocked
      if (!module.isUnlocked) {
        Alert.alert(t('learn.moduleLockedTitle'), t('learn.moduleLockedMessage'), [
          { text: t('common.ok') },
        ]);
        return;
      }

      // Voice announcement
      if (Platform.OS !== 'web' && state.isVoiceEnabled) {
        Speech.speak(t('learn.voice.moduleStarted', { module: module.title }), {
          language: locale,
          rate: state.voiceSpeed,
        });
      }

      // Navigate to first lesson if available
      if (module.lessons.length > 0) {
        const firstLesson = module.lessons[0];
        await startLesson(firstLesson);
      }
    },
    [state.isVoiceEnabled, state.voiceSpeed, t, locale]
  );

  // Start learning lesson
  const startLesson = useCallback(
    async (lesson: Lesson) => {
      setState(prev => ({ ...prev, currentLesson: lesson }));
      studySessionStartTime.current = new Date();

      // Voice announcement
      if (Platform.OS !== 'web' && state.isVoiceEnabled) {
        Speech.speak(t('learn.voice.lessonStarted', { lesson: lesson.title }), {
          language: locale,
          rate: state.voiceSpeed,
        });
      }
    },
    [state.isVoiceEnabled, state.voiceSpeed, t, locale]
  );

  // Update lesson progress
  const updateProgress = useCallback(
    async (progress: UserProgress) => {
      const updatedProgress = state.userProgress.filter(p => p.id !== progress.id);
      updatedProgress.push(progress);

      setState(prev => ({ ...prev, userProgress: updatedProgress }));

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(updatedProgress));

      // Sync to Supabase if online
      if (!state.isOffline) {
        await saveProgressToSupabase(progress);
      }
    },
    [state.userProgress, state.isOffline, saveProgressToSupabase]
  );

  // Complete lesson
  const completeLesson = useCallback(
    async (lessonId: string) => {
      const progressId = `${state.currentModule?.id}_${lessonId}`;
      const existingProgress = state.userProgress.find(p => p.id === progressId);

      if (existingProgress) {
        const completedProgress: UserProgress = {
          ...existingProgress,
          status: 'completed',
          completionPercentage: 100,
          lastModified: new Date(),
        };

        await updateProgress(completedProgress);

        // Check for achievements
        await checkForAchievements();

        // Voice celebration
        if (Platform.OS !== 'web' && state.isVoiceEnabled) {
          Speech.speak(t('learn.voice.lessonCompleted'), {
            language: locale,
            rate: state.voiceSpeed,
          });
        }
      }
    },
    [
      state.currentModule,
      state.userProgress,
      state.isVoiceEnabled,
      state.voiceSpeed,
      t,
      locale,
      updateProgress,
    ]
  );

  // Start quiz
  const startQuiz = useCallback(
    async (quiz: Quiz) => {
      // Voice announcement
      if (Platform.OS !== 'web' && state.isVoiceEnabled) {
        Speech.speak(t('learn.voice.quizStarted', { quiz: quiz.title }), {
          language: locale,
          rate: state.voiceSpeed,
        });
      }

      return quiz;
    },
    [state.isVoiceEnabled, state.voiceSpeed, t, locale]
  );

  // Submit quiz answers
  const submitQuiz = useCallback(
    async (quiz: Quiz, answers: QuizAnswer[], timeSpent: number): Promise<QuizAttempt> => {
      const score = answers.reduce((sum, answer) => sum + answer.points, 0);
      const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const percentage = (score / maxScore) * 100;
      const passed = percentage >= quiz.passingScore;

      const attempt: QuizAttempt = {
        id: `attempt_${Date.now()}`,
        quizId: quiz.id,
        userId: 'current_user', // TODO: Get from auth context
        score,
        maxScore,
        percentage,
        timeSpent,
        answers,
        completedAt: new Date(),
        passed,
      };

      // Update progress with quiz results
      if (state.currentLesson) {
        const progressId = `${state.currentModule?.id}_${state.currentLesson.id}`;
        const existingProgress = state.userProgress.find(p => p.id === progressId);

        if (existingProgress) {
          const updatedProgress: UserProgress = {
            ...existingProgress,
            quizAttempts: [...existingProgress.quizAttempts, attempt],
            bestQuizScore: Math.max(existingProgress.bestQuizScore || 0, percentage),
            lastModified: new Date(),
          };

          await updateProgress(updatedProgress);
        }
      }

      // Voice feedback
      if (Platform.OS !== 'web' && state.isVoiceEnabled) {
        const message = passed
          ? t('learn.voice.quizPassed', { score: percentage.toFixed(0) })
          : t('learn.voice.quizFailed', { score: percentage.toFixed(0) });

        Speech.speak(message, { language: locale, rate: state.voiceSpeed });
      }

      return attempt;
    },
    [
      state.currentModule,
      state.currentLesson,
      state.userProgress,
      state.isVoiceEnabled,
      state.voiceSpeed,
      t,
      locale,
      updateProgress,
    ]
  );

  // Add bookmark
  const addBookmark = useCallback(
    async (
      lessonId: string,
      sectionId?: string,
      title?: string,
      description?: string,
      timestamp?: number,
      notes?: string
    ) => {
      const bookmark: Bookmark = {
        id: `bookmark_${Date.now()}`,
        userId: 'current_user', // TODO: Get from auth context
        lessonId,
        sectionId,
        title: title || state.currentLesson?.title || 'Bookmark',
        description: description || '',
        timestamp,
        notes: notes || '',
        tags: [],
        createdAt: new Date(),
      };

      const updatedBookmarks = [...state.bookmarks, bookmark];
      setState(prev => ({ ...prev, bookmarks: updatedBookmarks }));

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updatedBookmarks));

      // Sync to Supabase if online
      if (!state.isOffline) {
        await saveBookmarkToSupabase(bookmark);
      }

      // Voice confirmation
      if (Platform.OS !== 'web' && state.isVoiceEnabled) {
        Speech.speak(t('learn.voice.bookmarkAdded'), { language: locale, rate: state.voiceSpeed });
      }
    },
    [
      state.bookmarks,
      state.currentLesson,
      state.isOffline,
      state.isVoiceEnabled,
      state.voiceSpeed,
      t,
      locale,
      saveBookmarkToSupabase,
    ]
  );

  // Practice with existing modules
  const practiceWithModule = useCallback(
    async (practiceLink: PracticeLink) => {
      // Voice announcement
      if (Platform.OS !== 'web' && state.isVoiceEnabled) {
        Speech.speak(t('learn.voice.practiceStarted', { module: practiceLink.title }), {
          language: locale,
          rate: state.voiceSpeed,
        });
      }

      // Navigate to the appropriate module
      switch (practiceLink.type) {
        case 'nutrient_calculator':
          router.push('/nutrient-calculator');
          break;
        case 'lighting_calculator':
          router.push('/lighting-calculator');
          break;
        case 'diy_builder':
          if (practiceLink.parameters?.systemType) {
            router.push({
              pathname: '/diy-builder',
              params: practiceLink.parameters,
            });
          } else {
            router.push('/diy-builder');
          }
          break;
        case 'external':
          if (practiceLink.route) {
            router.push(practiceLink.route);
          }
          break;
      }
    },
    [state.isVoiceEnabled, state.voiceSpeed, t, locale]
  );

  // Play voice narration
  const playVoiceNarration = useCallback(
    async (segments: VoiceSegment[]) => {
      if (!state.isVoiceEnabled || Platform.OS === 'web') return;

      for (const segment of segments) {
        if (currentVoiceRef.current !== segment.id) {
          currentVoiceRef.current = segment.id;

          await Speech.speak(segment.text, {
            language: locale,
            rate: state.voiceSpeed * (segment.emphasis === 'calm' ? 0.8 : 1.0),
            pitch: segment.emphasis === 'strong' ? 1.2 : 1.0,
          });

          if (segment.pauseAfter) {
            await new Promise(resolve => setTimeout(resolve, segment.pauseAfter! * 1000));
          }
        }
      }
    },
    [state.isVoiceEnabled, state.voiceSpeed, locale]
  );

  // Stop voice narration
  const stopVoiceNarration = useCallback(() => {
    if (Platform.OS !== 'web') {
      Speech.stop();
      currentVoiceRef.current = null;
    }
  }, []);

  // Update study time
  const updateStudyTime = useCallback(
    async (seconds: number) => {
      if (!state.currentLesson) return;

      const progressId = `${state.currentModule?.id}_${state.currentLesson.id}`;
      const existingProgress = state.userProgress.find(p => p.id === progressId);

      if (existingProgress) {
        const updatedProgress: UserProgress = {
          ...existingProgress,
          timeSpent: existingProgress.timeSpent + seconds,
          totalStudyTime: existingProgress.totalStudyTime + seconds,
          lastModified: new Date(),
        };

        await updateProgress(updatedProgress);
      }
    },
    [state.currentModule, state.currentLesson, state.userProgress, updateProgress]
  );

  // Check for achievements
  const checkForAchievements = useCallback(async () => {
    const completedLessons = state.userProgress.filter(p => p.status === 'completed').length;
    const totalStudyTime = state.userProgress.reduce((sum, p) => sum + p.totalStudyTime, 0);

    // Example achievement checks
    const potentialAchievements = [
      {
        id: 'first_lesson',
        type: 'completion' as const,
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: 'school',
        criteria: { completedLessons: 1 },
        points: 50,
        rarity: 'common' as const,
        check: () => completedLessons >= 1,
      },
      {
        id: 'study_streak_7',
        type: 'streak' as const,
        title: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        icon: 'flame',
        criteria: { streak: 7 },
        points: 200,
        rarity: 'rare' as const,
        check: () => state.currentStreak >= 7,
      },
      {
        id: 'study_time_3600',
        type: 'completion' as const,
        title: 'Hour of Power',
        description: 'Study for 1 hour total',
        icon: 'time',
        criteria: { totalTime: 3600 },
        points: 100,
        rarity: 'common' as const,
        check: () => totalStudyTime >= 3600,
      },
    ];

    const newAchievements = potentialAchievements.filter(achievement => {
      const alreadyUnlocked = state.achievements.some(a => a.id === achievement.id && a.unlockedAt);
      return !alreadyUnlocked && achievement.check();
    });

    if (newAchievements.length > 0) {
      const unlockedAchievements = newAchievements.map(a => ({
        ...a,
        unlockedAt: new Date(),
      }));

      const updatedAchievements = [...state.achievements, ...unlockedAchievements];
      setState(prev => ({ ...prev, achievements: updatedAchievements }));

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));

      // Show achievement notification
      for (const achievement of unlockedAchievements) {
        Alert.alert(
          t('learn.achievementUnlocked'),
          `${achievement.title}\n${achievement.description}`,
          [{ text: t('common.ok') }]
        );
      }
    }
  }, [state.userProgress, state.currentStreak, state.achievements, t]);

  return {
    // State
    ...state,

    // Module and lesson management
    startModule,
    startLesson,
    completeLesson,
    updateProgress,

    // Quiz functionality
    startQuiz,
    submitQuiz,

    // Bookmarks
    addBookmark,

    // Practice integration
    practiceWithModule,

    // Voice narration
    playVoiceNarration,
    stopVoiceNarration,

    // Progress tracking
    updateStudyTime,
    checkForAchievements,

    // Utility
    isInitialized: isInitialized.current,
  };
};
