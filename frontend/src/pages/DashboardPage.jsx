import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import api from "../lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Badge } from "../components/ui/Badge";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Separator } from "../components/ui/Separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/Dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/AlertDialog";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  BarChart3,
  Search,
  Trash2,
  Download,
  LogOut,
  Check,
  Clock,
  X,
  AlertCircle,
  RefreshCw,
  Cpu,
  ArrowRightLeft,
  Radio,
  FileSpreadsheet,
  CreditCard,
  CheckCircle2,
  FileText,
} from "lucide-react";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [dbUsers, setDbUsers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Student Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCourse, setRegCourse] = useState("B.S. Computer Science");
  const [regYear, setRegYear] = useState("1st Year");
  const [regRfid, setRegRfid] = useState("");
  const [regPassword, setRegPassword] = useState("student123");
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regError, setRegError] = useState("");

  // Hardware Simulation State
  const [simRfid, setSimRfid] = useState("E2806894000050");
  const [simStudentEmail, setSimStudentEmail] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Fetch registered users and attendance logs
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        api.get("/users"),
        api.get("/attendance/logs").catch(() => ({ data: { data: [] } })),
      ]);

      const usersList = usersRes.data?.data || [];
      const logsList = logsRes.data?.data || [];

      setDbUsers(usersList);
      setAttendanceLogs(logsList);

      const firstStudent = usersList.find((u) => u.role?.toLowerCase() === "student");
      if (firstStudent && !simStudentEmail) {
        setSimStudentEmail(firstStudent.email);
      }
    } catch (err) {
      console.warn("Failed to load initial data:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [simStudentEmail]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 4000);

    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchData]);

  // Filter students from database
  const students = useMemo(() => {
    return dbUsers.filter((u) => u.role?.toLowerCase() === "student");
  }, [dbUsers]);

  // Latest log map keyed by student email
  const latestLogsByStudent = useMemo(() => {
    const map = {};
    attendanceLogs.forEach((log) => {
      if (!map[log.studentEmail]) {
        map[log.studentEmail] = log;
      }
    });
    return map;
  }, [attendanceLogs]);

  // Filtered students for search in Students tab
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s._id?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Filtered logs for search in Logs tab
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return attendanceLogs;
    const q = searchQuery.toLowerCase();
    return attendanceLogs.filter(
      (l) =>
        l.studentName?.toLowerCase().includes(q) ||
        l.studentEmail?.toLowerCase().includes(q) ||
        l.rfidUid?.toLowerCase().includes(q)
    );
  }, [attendanceLogs, searchQuery]);

  // Calculate Overview Stats
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let late = 0;
    let onCampus = 0;

    Object.values(latestLogsByStudent).forEach((log) => {
      if (log.status === "Present") present++;
      if (log.status === "Late") late++;
      if (!log.timeOut) onCampus++;
    });

    const attended = present + late;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 100;
    const absent = Math.max(0, total - attended);

    return { total, present, late, absent, onCampus, rate };
  }, [students, latestLogsByStudent]);

  // Register Student Handler
  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || !regEmail.trim()) {
      setRegError("Please fill out both student name and email.");
      return;
    }

    setIsSubmittingReg(true);
    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword || "student123",
        role: "student",
        course: regCourse,
        yearLevel: regYear,
        rfidUid: regRfid.trim() || undefined,
      };

      await api.post("/users", payload);
      await fetchData();

      setRegName("");
      setRegEmail("");
      setRegRfid("");
      setRegPassword("student123");
      setIsRegModalOpen(false);

      toast.show({
        title: "Student Registered",
        description: `${payload.name} has been enrolled in the database.`,
        variant: "success",
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to register student.";
      setRegError(msg);
      toast.show({
        title: "Registration Error",
        description: msg,
        variant: "error",
      });
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Delete Student Handler
  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from the student database?`)) return;

    try {
      await api.delete(`/users/${id}`);
      setDbUsers((prev) => prev.filter((u) => u._id !== id));
      toast.show({
        title: "Student Deleted",
        description: `${name} has been removed from the database.`,
        variant: "default",
      });
    } catch (err) {
      toast.show({
        title: "Delete Failed",
        description: err.response?.data?.message || "Could not delete student.",
        variant: "error",
      });
    }
  };

  // Trigger Hardware Scan (Simulates physical RFID or Barcode tap)
  const handleHardwareScan = async (selectedEmail = simStudentEmail) => {
    if (!selectedEmail) {
      toast.show({
        title: "Student Required",
        description: "Please select a student to simulate tapping.",
        variant: "warning",
      });
      return;
    }

    setIsScanning(true);
    try {
      const response = await api.post("/attendance/scan", {
        studentEmail: selectedEmail,
        rfidUid: simRfid,
        method: "RFID",
        terminalId: "HARDWARE_TERMINAL_01",
      });

      const data = response.data;
      setLastScanResult(data);
      await fetchData();

      const actionTitle = data.action === "TIME_IN" ? "Clocked IN" : "Clocked OUT";
      toast.show({
        title: actionTitle,
        description: data.message,
        variant: data.action === "TIME_IN" ? "success" : "brand",
      });
    } catch (err) {
      toast.show({
        title: "Scan Error",
        description: err.response?.data?.message || err.message,
        variant: "error",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Student Name,Email,Date,Time In,Time Out,Duration,Status,Method,RFID UID\n";
    const rows = attendanceLogs
      .map(
        (l) =>
          `"${l.studentName}","${l.studentEmail}","${l.date}","${l.timeIn || "--"}","${l.timeOut || "On Campus"
          }","${l.durationFormatted || "--"}","${l.status}","${l.method}","${l.rfidUid || "--"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.show({
      title: "Logs Exported",
      description: "Attendance records downloaded as CSV.",
      variant: "success",
    });
  };

  const getInitials = (name) => {
    return name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "ST";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 font-sans">
      {/* ========================================================
          ROOT TABS NAVIGATION (Clean, Streamlined, No Redundancy)
          4 Unified Tabs:
          1. overview  -> Home & Daily Overview
          2. logs      -> Time-In / Time-Out Hardware Logs
          3. students  -> Student Directory & Enrollment
          4. reports   -> Analytics & Export
      ======================================================== */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col md:flex-row min-h-screen"
      >
        {/* ======================================================
            LEFT SIDEBAR
        ====================================================== */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
          <div>
            {/* Logo */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#8ecae6] flex items-center justify-center text-[#023047] font-bold text-base shadow-xs">
                AI
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
                  AttendIQ
                </span>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Nav Menu */}
            <div className="p-3">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Menu
              </p>
              <TabsList className="w-full flex flex-col gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors data-[state=active]:bg-[#8ecae6]/20 data-[state=active]:text-[#023047] data-[state=active]:font-semibold cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#219ebc]" />
                  <span>Home</span>
                </TabsTrigger>

                <TabsTrigger
                  value="logs"
                  className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors data-[state=active]:bg-[#8ecae6]/20 data-[state=active]:text-[#023047] data-[state=active]:font-semibold cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-[#219ebc]" />
                  <span>Time-In / Time-Out</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Live
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="students"
                  className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors data-[state=active]:bg-[#8ecae6]/20 data-[state=active]:text-[#023047] data-[state=active]:font-semibold cursor-pointer"
                >
                  <Users className="h-4 w-4 text-[#219ebc]" />
                  <span>Students</span>
                  <span className="ml-auto text-xs text-slate-400">{students.length}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="reports"
                  className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors data-[state=active]:bg-[#8ecae6]/20 data-[state=active]:text-[#023047] data-[state=active]:font-semibold cursor-pointer"
                >
                  <BarChart3 className="h-4 w-4 text-[#219ebc]" />
                  <span>Reports</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Bottom Sidebar: Admin User & Logout Alert Dialog */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Avatar className="h-8 w-8 border border-slate-200 shrink-0">
                  <AvatarFallback className="bg-[#8ecae6] text-[#023047] font-bold text-xs">
                    {getInitials(user?.name || "Admin")}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.name || "System Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">
                    {user?.role || "Admin"}
                  </p>
                </div>
              </div>

              {/* Radix UI Logout Confirmation Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    title="Sign out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of the AttendIQ Admin Portal and returned to the login screen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={logout}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </aside>

        {/* ======================================================
            MAIN WORKSPACE AREA
        ====================================================== */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar */}
          <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Admin</span>
              <span>/</span>
              <span className="capitalize font-medium">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "logs" && "Time-In / Time-Out Logs"}
                {activeTab === "students" && "Students Directory & Enrollment"}
                {activeTab === "reports" && "Attendance Reports"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </header>

          {/* ====================================================
              MAIN TAB CONTENTS
          ==================================================== */}
          <main className="p-6 max-w-7xl w-full mx-auto space-y-6">

            {/* --------------------------------------------------
                TAB 1: HOME / OVERVIEW
            -------------------------------------------------- */}
            <TabsContent value="overview" className="space-y-6 m-0">
              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Total Students</span>
                    <Users className="h-4 w-4 text-[#219ebc]" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <p className="text-xs text-slate-500 mt-1">Enrolled in system</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Currently On Campus</span>
                    <Clock className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-emerald-700">{stats.onCampus}</div>
                    <p className="text-xs text-slate-500 mt-1">Timed in, not yet timed out</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Attendance Rate</span>
                    <Check className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-slate-900">{stats.rate}%</div>
                    <p className="text-xs text-slate-500 mt-1">{stats.late} late arrivals</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Absent Today</span>
                    <X className="h-4 w-4 text-rose-600" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-rose-600">{stats.absent}</div>
                    <p className="text-xs text-slate-500 mt-1">No time-in scan yet</p>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Campus Status Table */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-slate-100">
                  <div>
                    <CardTitle className="text-base">Today's Campus Presence</CardTitle>
                    <CardDescription>Live attendance snapshot for all enrolled students</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("logs")} className="text-xs">
                    View Full Logs
                  </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Student</th>
                        <th className="py-2.5 px-4">Email</th>
                        <th className="py-2.5 px-4">Time-In</th>
                        <th className="py-2.5 px-4">Time-Out</th>
                        <th className="py-2.5 px-4">Campus Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => {
                        const log = latestLogsByStudent[student.email];
                        return (
                          <tr key={student._id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium text-xs text-slate-900">{student.name}</td>
                            <td className="py-3 px-4 text-xs text-slate-500">{student.email}</td>
                            <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-700">
                              {log?.timeIn || "--:--"}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs font-bold text-amber-700">
                              {log?.timeOut || (log ? "On Campus" : "--:--")}
                            </td>
                            <td className="py-3 px-4">
                              {log ? (
                                log.timeOut ? (
                                  <Badge variant="default" className="text-[10px]">
                                    Departed ({log.durationFormatted || "--"})
                                  </Badge>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                                    🟢 On Campus
                                  </span>
                                )
                              ) : (
                                <Badge variant="absent" className="text-[10px]">
                                  Not Scanned
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --------------------------------------------------
                TAB 2: TIME-IN / TIME-OUT LOGS (Hardware Feed)
            -------------------------------------------------- */}
            <TabsContent value="logs" className="space-y-6 m-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Time-In & Time-Out Hardware Logs</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Live hardware scan history received from your RFID reader or Postman tests.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="h-9 text-xs gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </Button>
                </div>
              </div>

              {/* Hardware Scanner / Postman Simulator Card */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-[#219ebc]" />
                      <span>Hardware Scanner Terminal Simulator</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Simulates an RFID card tap. 1st tap records Time-In, 2nd tap records Time-Out.
                    </CardDescription>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    POST /api/attendance/scan
                  </span>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">Select Student to Tap</Label>
                      <select
                        value={simStudentEmail}
                        onChange={(e) => setSimStudentEmail(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-[#219ebc]"
                      >
                        {students.map((s) => (
                          <option key={s._id} value={s.email}>
                            {s.name} ({s.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">RFID UID / Badge #</Label>
                      <Input
                        value={simRfid}
                        onChange={(e) => setSimRfid(e.target.value)}
                        placeholder="E2806894000050"
                        className="h-9 text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <Button
                        type="button"
                        onClick={() => handleHardwareScan(simStudentEmail)}
                        disabled={isScanning}
                        className="w-full h-9 bg-[#023047] hover:bg-[#0f4c64] text-white text-xs font-medium cursor-pointer"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                        <span>Simulate Tap</span>
                      </Button>
                    </div>
                  </div>

                  {lastScanResult && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between animate-in fade-in">
                      <span className="font-semibold">{lastScanResult.message}</span>
                      <Badge variant="brand" className="text-[10px]">
                        {lastScanResult.action}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Logs Table */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search student or RFID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Showing <strong>{filteredLogs.length}</strong> total hardware log events
                  </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">RFID UID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-emerald-800 font-bold">Time-In</th>
                        <th className="py-3 px-4 text-amber-800 font-bold">Time-Out</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                            No hardware scan logs recorded yet. Use the simulator above or Postman.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-900 text-xs">{log.studentName}</div>
                              <div className="text-[11px] text-slate-400">{log.studentEmail}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-500">
                              {log.rfidUid || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600">{log.date}</td>
                            <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-700">
                              {log.timeIn || "--:--"}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs font-bold">
                              {log.timeOut ? (
                                <span className="text-amber-700">{log.timeOut}</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                                  On Campus
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                              {log.durationFormatted || "--"}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-[10px]">
                                {log.method}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={log.status?.toLowerCase()}>{log.status}</Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --------------------------------------------------
                TAB 3: STUDENTS DIRECTORY & ENROLLMENT
            -------------------------------------------------- */}
            <TabsContent value="students" className="space-y-4 m-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Student Directory</h1>
                  <p className="text-sm text-slate-500">
                    Manage student profiles and hardware RFID badge assignments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>

                  {/* Register Student Modal Dialog */}
                  <Dialog open={isRegModalOpen} onOpenChange={setIsRegModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-9 text-xs gap-1.5 bg-[#023047] hover:bg-[#0f4c64] text-white cursor-pointer"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Register Student</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Register New Student</DialogTitle>
                        <DialogDescription>
                          Create an enrolled student record in MongoDB with credentials and optional RFID badge UID.
                        </DialogDescription>
                      </DialogHeader>

                      {regError && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{regError}</span>
                        </div>
                      )}

                      <form onSubmit={handleRegisterStudent} className="space-y-3.5 py-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-name" className="text-xs font-semibold text-slate-700">
                            Full Name <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="reg-name"
                            placeholder="e.g. Jordan Lee"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">
                            Email Address <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="jordan.lee@attendance.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-course" className="text-xs font-semibold text-slate-700">
                              Program / Degree
                            </Label>
                            <select
                              id="reg-course"
                              value={regCourse}
                              onChange={(e) => setRegCourse(e.target.value)}
                              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#219ebc]"
                            >
                              <option value="B.S. Computer Science">B.S. Computer Science</option>
                              <option value="B.S. Information Tech">B.S. Information Tech</option>
                              <option value="B.S. Software Eng">B.S. Software Eng</option>
                              <option value="B.S. Computer Engineering">B.S. Computer Engineering</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="reg-year" className="text-xs font-semibold text-slate-700">
                              Year Level
                            </Label>
                            <select
                              id="reg-year"
                              value={regYear}
                              onChange={(e) => setRegYear(e.target.value)}
                              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#219ebc]"
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="reg-rfid" className="text-xs font-semibold text-slate-700">
                              RFID Badge UID <span className="text-slate-400 font-normal">(Optional)</span>
                            </Label>
                            <span className="text-[11px] text-slate-400">For hardware tap</span>
                          </div>
                          <Input
                            id="reg-rfid"
                            value={regRfid}
                            onChange={(e) => setRegRfid(e.target.value)}
                            placeholder="e.g. E2806894000050 or RFID-01"
                            className="h-9 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="reg-pass" className="text-xs font-semibold text-slate-700">
                              Initial Password
                            </Label>
                            <span className="text-[11px] text-slate-400">Default: student123</span>
                          </div>
                          <Input
                            id="reg-pass"
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="student123"
                            className="h-9 text-sm"
                          />
                        </div>

                        <DialogFooter className="pt-2">
                          <DialogClose asChild>
                            <Button variant="outline" type="button" className="h-9 text-xs">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            type="submit"
                            disabled={isSubmittingReg}
                            className="h-9 text-xs bg-[#023047] hover:bg-[#0f4c64] text-white"
                          >
                            {isSubmittingReg ? "Registering..." : "Save Student"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Students Roster Table */}
              <Card className="border-slate-200 shadow-xs">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4">Year Level</th>
                        <th className="py-3 px-4">RFID Badge</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                            No students registered yet. Click "Register Student" to enroll one.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-7 w-7 border border-slate-200">
                                  <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold">
                                    {getInitials(student.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-900 text-xs">
                                  {student.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600">{student.email}</td>
                            <td className="py-3 px-4 text-xs font-medium text-slate-700">
                              {student.course || "B.S. Computer Science"}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600">
                              {student.yearLevel || "1st Year"}
                            </td>
                            <td className="py-3 px-4">
                              {student.rfidUid ? (
                                <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 inline-flex items-center gap-1">
                                  <CreditCard className="h-3 w-3 text-[#219ebc]" />
                                  {student.rfidUid}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleDeleteStudent(student._id, student.name)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --------------------------------------------------
                TAB 4: REPORTS & ANALYTICS
            -------------------------------------------------- */}
            <TabsContent value="reports" className="space-y-6 m-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Attendance Reports & Analytics</h1>
                  <p className="text-sm text-slate-500">
                    Aggregated metrics, arrival punctuality, and complete CSV data export.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-9 text-xs gap-1.5 bg-[#023047] hover:bg-[#0f4c64] text-white cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Full CSV</span>
                </Button>
              </div>

              {/* Analytical Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Total Scan Events</span>
                    <Clock className="h-4 w-4 text-[#219ebc]" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-slate-900">{attendanceLogs.length}</div>
                    <p className="text-xs text-slate-500 mt-1">Logged Time-In / Time-Outs</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Attendance Rate</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-emerald-700">{stats.rate}%</div>
                    <p className="text-xs text-slate-500 mt-1">Of enrolled student body</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">On-Time Arrival Rate</span>
                    <Check className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-blue-700">
                      {stats.present + stats.late > 0
                        ? Math.round((stats.present / (stats.present + stats.late)) * 100)
                        : 100}
                      %
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{stats.present} on-time vs {stats.late} late</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Currently On Campus</span>
                    <Users className="h-4 w-4 text-amber-600" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-amber-700">{stats.onCampus}</div>
                    <p className="text-xs text-slate-500 mt-1">Students awaiting checkout</p>
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown & Hardware Method Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="p-4 pb-3 border-b border-slate-100">
                    <CardTitle className="text-sm">Today's Punctuality Breakdown</CardTitle>
                    <CardDescription className="text-xs">Distribution of arrival statuses</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span> On-Time Arrivals
                        </span>
                        <span className="text-slate-700 font-bold">{stats.present}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{
                            width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-amber-700 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span> Late Arrivals
                        </span>
                        <span className="text-slate-700 font-bold">{stats.late}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{
                            width: `${stats.total > 0 ? (stats.late / stats.total) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-rose-700 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-rose-500"></span> Absent / Not Scanned
                        </span>
                        <span className="text-slate-700 font-bold">{stats.absent}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{
                            width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Data Center Card */}
                <Card className="border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <CardHeader className="p-4 pb-3 border-b border-slate-100">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-[#219ebc]" />
                        <span>Attendance Export Center</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Export historical records for administrative archival or spreadsheet analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 text-xs text-slate-600">
                      <p>
                        The generated CSV export includes all hardware scan logs with full timestamps, RFID card UIDs, calculated on-campus durations, and punctuality statuses.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">UTF-8 CSV</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">9 Columns</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{attendanceLogs.length} Records</span>
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      onClick={handleExportCSV}
                      className="w-full h-9 text-xs gap-1.5 border-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-600" />
                      <span>Download CSV Spreadsheet</span>
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </main>
        </div>
      </Tabs>
    </div>
  );
}
