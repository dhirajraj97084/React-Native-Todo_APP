import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

export default function App() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  const pageGutter = width < 380 ? 14 : width < 768 ? 20 : width < 1200 ? 30 : 40;

  const MAX_TASK_LENGTH = 120;
  const [task, setTask] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [todos, setTodos] = useState([
    { id: "1", title: "Finalize landing mockup", completed: false },
    { id: "2", title: "Refine onboarding notes", completed: false },
    { id: "3", title: "Ship beta build", completed: true },
  ]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((item) => !item.completed);
    if (filter === "done") return todos.filter((item) => item.completed);
    return todos;
  }, [filter, todos]);

  const completedCount = todos.filter((item) => item.completed).length;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  const submitTask = () => {
    const trimmed = task.trim();
    if (!trimmed) {
      setError("Please enter a task first.");
      return;
    }
    if (trimmed.length > MAX_TASK_LENGTH) {
      setError(`Task should be under ${MAX_TASK_LENGTH} characters.`);
      return;
    }

    if (editingId) {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, title: trimmed } : item,
        ),
      );
      setEditingId(null);
      setTask("");
      setError("");
      return;
    }
    setTodos((prev) => [
      { id: Date.now().toString(), title: trimmed, completed: false },
      ...prev,
    ]);
    setTask("");
    setError("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setTask("");
    }
  };

  const clearCompleted = () => {
    setTodos((prev) => {
      const next = prev.filter((item) => !item.completed);
      if (editingId && !next.some((item) => item.id === editingId)) {
        setEditingId(null);
        setTask("");
      }
      return next;
    });
  };

  const startEdit = (id: string) => {
    const target = todos.find((item) => item.id === id);
    if (!target) return;
    setEditingId(id);
    setTask(target.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTask("");
    setError("");
  };

  const canSubmit = task.trim().length > 0 && task.trim().length <= MAX_TASK_LENGTH;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.bgBase} />
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />
        <View style={styles.bgOrbThree} />

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: pageGutter,
            paddingTop: 18,
            paddingBottom: 48,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.shell, (isTablet || isDesktop) && styles.shellCentered]}>
            <Text style={styles.kicker}>Focus Workspace</Text>
            <Text style={[styles.title, isDesktop ? styles.titleDesktop : isTablet ? styles.titleTablet : null]}>
              Todo Craft
            </Text>
            <Text style={styles.subtitle}>
              A high-clarity planner that adapts beautifully from small phones to large desktop screens.
            </Text>

            <View style={[styles.topGrid, isDesktop && styles.topGridDesktop]}>
              <View style={[styles.panel, isDesktop && styles.panelGrow]}>
                <Text style={styles.panelLabel}>
                  {editingId ? "Edit Task" : "Add Task"}
                </Text>
                <View style={[styles.addRow, isTablet && styles.addRowTablet]}>
                  <TextInput
                    style={[styles.input, isTablet && styles.inputGrow]}
                    placeholder={editingId ? "Update your task..." : "What should we finish next?"}
                    placeholderTextColor="#8f9bb3"
                    value={task}
                    onChangeText={(value) => {
                      if (error) setError("");
                      setTask(value);
                    }}
                    onSubmitEditing={submitTask}
                    returnKeyType="done"
                    maxLength={MAX_TASK_LENGTH}
                  />
                  <Pressable
                    onPress={submitTask}
                    disabled={!canSubmit}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.mainButton,
                      editingId ? styles.mainButtonEdit : styles.mainButtonAdd,
                      canSubmit && styles.mainButtonReady,
                      !canSubmit && styles.mainButtonDisabled,
                      !isTablet && styles.mainButtonMobileSpacing,
                      isTablet && styles.mainButtonTablet,
                      pressed && canSubmit && styles.pressed,
                    ]}
                  >
                    <Text style={styles.mainButtonText}>
                      {editingId ? "Submit Update" : "Add Task"}
                    </Text>
                  </Pressable>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Text style={styles.charCount}>
                  {task.trim().length}/{MAX_TASK_LENGTH}
                </Text>
                {editingId ? (
                  <Pressable
                    onPress={cancelEdit}
                    style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Edit</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={[styles.panel, styles.metricsPanel, !isDesktop && styles.metricsPanelMobile]}>
                <Text style={styles.panelLabel}>Overview</Text>
                <View style={styles.progressTop}>
                  <Text style={styles.progressValue}>{progress}%</Text>
                  <Text style={styles.progressHint}>
                    {completedCount}/{todos.length} done
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Pressable
                  onPress={clearCompleted}
                  disabled={!completedCount}
                  style={({ pressed }) => [
                    styles.clearBtn,
                    !completedCount && styles.clearBtnDisabled,
                    pressed && completedCount ? styles.pressed : null,
                  ]}
                >
                  <Text style={[styles.clearBtnText, !completedCount && styles.clearBtnTextDisabled]}>
                    Clear Completed
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.filterRow}>
              {(["all", "active", "done"] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    filter === item && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterChipText, filter === item && styles.filterChipTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.todoList}>
              {filteredTodos.map((item) => (
                <View
                  key={item.id}
                  style={[styles.todoCard, isTablet ? styles.todoCardTablet : styles.todoCardMobile]}
                >
                  <Pressable
                    onPress={() => toggleTodo(item.id)}
                    style={({ pressed }) => [
                      styles.check,
                      item.completed ? styles.checkActive : styles.checkIdle,
                      isTablet ? styles.checkTablet : styles.checkMobile,
                      pressed && styles.pressed,
                    ]}
                  >
                    {item.completed ? <Text style={styles.checkText}>OK</Text> : null}
                  </Pressable>

                  <View style={[isTablet ? styles.todoBodyTablet : styles.todoBodyMobile]}>
                    <Text style={[styles.todoTitle, item.completed && styles.todoTitleDone]}>
                      {item.title}
                    </Text>
                    <Text style={styles.todoState}>
                      {item.completed ? "Completed" : "In progress"}
                    </Text>
                  </View>

                  <View style={[isTablet ? styles.todoActionTablet : styles.todoActionMobile]}>
                    <Pressable
                      onPress={() => startEdit(item.id)}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.editBtn,
                        !isTablet && styles.actionBtnGrow,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => deleteTodo(item.id)}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.deleteBtn,
                        !isTablet && styles.actionBtnGrow,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              {!filteredTodos.length ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Nothing here yet</Text>
                  <Text style={styles.emptyText}>
                    Add a new task or switch filters to view other items.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#041019",
  },
  flex: {
    flex: 1,
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#041019",
  },
  bgOrbOne: {
    position: "absolute",
    top: -100,
    left: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
  },
  bgOrbTwo: {
    position: "absolute",
    top: 120,
    right: -90,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(45, 212, 191, 0.2)",
  },
  bgOrbThree: {
    position: "absolute",
    bottom: -60,
    left: 40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(14, 165, 233, 0.12)",
  },
  shell: {
    width: "100%",
  },
  shellCentered: {
    maxWidth: 1120,
    alignSelf: "center",
  },
  kicker: {
    color: "#bff7e5",
    letterSpacing: 2.8,
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "900",
  },
  titleTablet: {
    fontSize: 54,
  },
  titleDesktop: {
    fontSize: 64,
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 760,
    color: "#b2c3d7",
    fontSize: 16,
    lineHeight: 24,
  },
  topGrid: {
    marginTop: 28,
  },
  topGridDesktop: {
    flexDirection: "row",
    gap: 18,
  },
  panel: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(11, 23, 36, 0.74)",
    borderRadius: 24,
    padding: 16,
  },
  panelGrow: {
    flex: 1,
  },
  panelLabel: {
    color: "#c7d2df",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.7,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  addRow: {},
  addRowTablet: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(3, 10, 20, 0.75)",
    color: "#edf5ff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
  },
  inputGrow: {
    flex: 1,
  },
  mainButton: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonMobileSpacing: {
    marginTop: 12,
    width: "100%",
  },
  mainButtonTablet: {
    minWidth: 190,
  },
  mainButtonAdd: {
    backgroundColor: "#22c55e",
  },
  mainButtonEdit: {
    backgroundColor: "#fbbf24",
  },
  mainButtonReady: {
    shadowColor: "#34d399",
    shadowOpacity: 0.38,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  mainButtonText: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  mainButtonDisabled: {
    opacity: 1,
    backgroundColor: "#334155",
    borderColor: "#475569",
  },
  errorText: {
    marginTop: 8,
    color: "#fda4af",
    fontSize: 12,
    fontWeight: "600",
  },
  charCount: {
    marginTop: 6,
    color: "#8ea1b8",
    fontSize: 11,
    textAlign: "right",
  },
  cancelBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(164, 184, 209, 0.45)",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#c8d4e3",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  metricsPanel: {
    width: 360,
    backgroundColor: "rgba(8, 17, 28, 0.9)",
  },
  metricsPanelMobile: {
    width: "100%",
    marginTop: 12,
  },
  progressTop: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  progressValue: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "900",
  },
  progressHint: {
    color: "#b7c5d5",
    fontSize: 14,
  },
  progressTrack: {
    marginTop: 8,
    height: 11,
    borderRadius: 99,
    backgroundColor: "#243649",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#34d399",
  },
  clearBtn: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: "rgba(251, 113, 133, 0.22)",
    alignItems: "center",
    paddingVertical: 10,
  },
  clearBtnDisabled: {
    backgroundColor: "rgba(80, 98, 120, 0.42)",
  },
  clearBtnText: {
    color: "#fecdd3",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
  clearBtnTextDisabled: {
    color: "#94a3b8",
  },
  filterRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  filterChip: {
    backgroundColor: "#162538",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: "#34d399",
    borderColor: "#34d399",
  },
  filterChipText: {
    color: "#c2cfdf",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  filterChipTextActive: {
    color: "#041019",
  },
  todoList: {
    marginTop: 16,
    gap: 12,
  },
  todoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(9, 20, 32, 0.83)",
    padding: 14,
  },
  todoCardTablet: {
    flexDirection: "row",
    alignItems: "center",
  },
  todoCardMobile: {},
  check: {
    width: 30,
    height: 30,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  checkIdle: {
    borderColor: "#5d728b",
  },
  checkActive: {
    borderColor: "#34d399",
    backgroundColor: "#34d399",
  },
  checkTablet: {
    marginRight: 12,
  },
  checkMobile: {
    marginBottom: 10,
  },
  checkText: {
    color: "#051821",
    fontSize: 10,
    fontWeight: "800",
  },
  todoBodyTablet: {
    flex: 1,
  },
  todoBodyMobile: {
    width: "100%",
  },
  todoTitle: {
    color: "#e8f0fc",
    fontSize: 16,
    fontWeight: "600",
  },
  todoTitleDone: {
    color: "#8ca1b7",
    textDecorationLine: "line-through",
  },
  todoState: {
    marginTop: 3,
    color: "#8ca1b7",
    fontSize: 12,
  },
  todoActionTablet: {
    marginLeft: 12,
    flexDirection: "row",
    gap: 8,
  },
  todoActionMobile: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  actionBtn: {
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionBtnGrow: {
    flex: 1,
  },
  editBtn: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
  },
  deleteBtn: {
    backgroundColor: "rgba(244, 63, 94, 0.2)",
  },
  editText: {
    color: "#fef3c7",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  deleteText: {
    color: "#fecdd3",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4f6077",
    backgroundColor: "rgba(10, 21, 32, 0.5)",
    paddingVertical: 34,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: "#dbe6f5",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 8,
    color: "#9aaec7",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.85,
  },
});
