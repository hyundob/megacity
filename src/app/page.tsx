"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AreaChart, LineChart, CartesianGrid, XAxis, YAxis, Area, Line, Tooltip, ResponsiveContainer } from "recharts"
import { Progress } from "@/components/ui/progress"
import { Tooltip as RadixTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Bell,
    BellRing,
    Cloud,
    CloudRain,
    Edit,
    Grid3X3,
    Info,
    LayoutDashboard,
    Maximize2,
    Minimize2,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Settings,
    Sun,
    Wind,
} from "lucide-react"

export default function RealTimeDashboard() {
    // 상태 관리
    const [currentTime, setCurrentTime] = useState(new Date())
    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [notifications, setNotifications] = useState([
        { id: 1, type: "warning", message: "태양광 발전량 급감 감지", time: "10분 전", read: false },
        { id: 2, type: "info", message: "기상 데이터 업데이트 완료", time: "30분 전", read: true },
        { id: 3, type: "critical", message: "전력 수요 예측치 초과", time: "1시간 전", read: false },
    ])
    const [widgets, setWidgets] = useState([
        { id: "weather", title: "기상 현황", type: "weather", size: "small", visible: true },
        { id: "solar", title: "태양광 발전", type: "generation", size: "small", visible: true },
        { id: "wind", title: "풍력 발전", type: "generation", size: "small", visible: true },
        { id: "demand", title: "전력 수요", type: "demand", size: "small", visible: true },
        { id: "generation-trend", title: "발전량 추이", type: "chart", size: "medium", visible: true },
        { id: "demand-trend", title: "수요 추이", type: "chart", size: "medium", visible: true },
        { id: "p2g-status", title: "P2G 상태", type: "p2g", size: "small", visible: true },
        { id: "sector-coupling", title: "섹터커플링 현황", type: "sector", size: "small", visible: true },
        { id: "derms", title: "DERMS 연동", type: "derms", size: "small", visible: true },
        { id: "ess-schedule", title: "ESS 운영 전략", type: "ess", size: "medium", visible: true },
        { id: "alerts", title: "실시간 알림", type: "alerts", size: "small", visible: true },
        { id: "status", title: "시스템 상태", type: "status", size: "small", visible: true },
    ])
    const [unreadCount, setUnreadCount] = useState(2)
    const [systemStatus, setSystemStatus] = useState({
        api: { status: "normal", latency: 120 },
        database: { status: "normal", latency: 85 },
        prediction: { status: "warning", latency: 350 },
    })

    // 샘플 데이터
    const weatherData = {
        current: { temperature: 23, humidity: 65, windSpeed: 8, condition: "sunny" },
        forecast: [
            { time: "12:00", temperature: 24, condition: "sunny" },
            { time: "15:00", temperature: 25, condition: "partly-cloudy" },
            { time: "18:00", temperature: 22, condition: "cloudy" },
            { time: "21:00", temperature: 20, condition: "rainy" },
        ],
    }

    const generationData = {
        solar: { current: 320, predicted: 350, capacity: 500, efficiency: 64 },
        wind: { current: 180, predicted: 200, capacity: 300, efficiency: 60 },
        total: { current: 500, predicted: 550, target: 600 },
    }

    const demandData = {
        current: 850,
        predicted: 900,
        peak: 1200,
        valley: 600,
    }

    const generationTrendData = [
        { time: "09:00", solar: 250, wind: 150, predicted: 420 },
        { time: "10:00", solar: 280, wind: 160, predicted: 450 },
        { time: "11:00", solar: 310, wind: 170, predicted: 480 },
        { time: "12:00", solar: 320, wind: 180, predicted: 510 },
        { time: "13:00", solar: 330, wind: 175, predicted: 520 },
        { time: "14:00", solar: 325, wind: 170, predicted: 510 },
    ]

    const demandTrendData = [
        { time: "09:00", actual: 780, predicted: 800 },
        { time: "10:00", actual: 820, predicted: 830 },
        { time: "11:00", actual: 840, predicted: 860 },
        { time: "12:00", actual: 850, predicted: 880 },
        { time: "13:00", actual: 870, predicted: 890 },
        { time: "14:00", actual: 880, predicted: 900 },
    ]

    // P2G 데이터
    const p2gData = {
        status: "운전중",
        conversionRate: 68,
        currentPower: 120,
        hydrogenProduction: 2.4,
        efficiency: 65,
        dailyProduction: 42.5,
    }

    // 섹터커플링 데이터
    const sectorCouplingData = {
        surplusPower: 180,
        utilizationRate: 78,
        p2gAllocation: 65,
        p2hAllocation: 25,
        batteryAllocation: 10,
        co2Reduction: 12.5,
    }

    // DERMS 연동 데이터
    const dermsData = {
        connectedResources: 24,
        activeResources: 18,
        totalCapacity: 850,
        currentUtilization: 520,
        responseTime: 2.4,
        lastSync: "10분 전",
    }

    // ESS 운영 데이터
    const essData = {
        currentSOC: 68,
        optimalChargeTime: ["02:00", "04:00", "14:00"],
        optimalDischargeTime: ["10:00", "18:00", "20:00"],
        scheduledEvents: [
            { time: "14:00", action: "충전", amount: 120, duration: 2, reason: "잉여전력 활용" },
            { time: "18:00", action: "방전", amount: 150, duration: 3, reason: "피크 저감" },
        ],
        dailySavings: 4.2,
        strategy: "피크 저감 우선",
    }

    // ESS 스케줄 데이터
    const essScheduleData = [
        { time: "00:00", charge: 20, discharge: 0, soc: 45 },
        { time: "03:00", charge: 80, discharge: 0, soc: 55 },
        { time: "06:00", charge: 40, discharge: 0, soc: 60 },
        { time: "09:00", charge: 0, discharge: 30, soc: 55 },
        { time: "12:00", charge: 0, discharge: 60, soc: 45 },
        { time: "15:00", charge: 90, discharge: 0, soc: 60 },
        { time: "18:00", charge: 0, discharge: 100, soc: 40 },
        { time: "21:00", charge: 0, discharge: 50, soc: 30 },


    ]

    // 실시간 시계 및 데이터 업데이트 효과
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // 자동 새로고침 기능
        let dataRefreshInterval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            dataRefreshInterval = setInterval(() => {
                // 실제로는 여기서 API 호출을 통해 데이터를 가져옴
                setLastUpdated(new Date());

                // 샘플 데이터 업데이트 시뮬레이션
                const randomChange = () => Math.random() * 10 - 5;

                // 랜덤하게 알림 추가 (10% 확률)
                if (Math.random() < 0.1) {
                    const newNotification = {
                        id: Date.now(),
                        type: Math.random() < 0.3 ? "warning" : "info",
                        message: `${Math.random() < 0.5 ? "태양광" : "풍력"} 발전량 ${Math.random() < 0.5 ? "증가" : "감소"} 감지`,
                        time: "방금 전",
                        read: false,
                    };
                    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
                    setUnreadCount((prev) => prev + 1);
                }
            }, 30000); // 30초마다 데이터 갱신
        }

        // 클린업 함수
        return () => {
            clearInterval(clockInterval);
            if (dataRefreshInterval) clearInterval(dataRefreshInterval);
        };
    }, [autoRefresh]);

    // 알림 읽음 처리
    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    // 위젯 레이아웃 변경
    const toggleWidgetSize = (id: string) => {
        setWidgets(
            widgets.map((widget) =>
                widget.id === id
                    ? { ...widget, size: widget.size === "small" ? "medium" : widget.size === "medium" ? "large" : "small" }
                    : widget,
            ),
        )
    }

    // 위젯 가시성 토글
    const toggleWidgetVisibility = (id: string) => {
        setWidgets(widgets.map((widget) => (widget.id === id ? { ...widget, visible: !widget.visible } : widget)))
    }

    // 날짜 및 시간 포맷팅
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }

    // 위젯 크기에 따른 클래스 결정
    const getWidgetSizeClass = (size: string | undefined) => {
        switch (size) {
            case "small":
                return "col-span-1"
            case "medium":
                return "col-span-2"
            case "large":
                return "col-span-3"
            default:
                return "col-span-1"
        }
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* 헤더 */}
            <header className="border-b p-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <h1 className="font-bold text-lg">에너지 통합 모니터링 시스템</h1>
                    <Badge variant="outline" className="ml-2">
                        실시간
                    </Badge>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">{formatDate(currentTime)}</div>
                    <div className="text-sm font-medium">{formatTime(currentTime)}</div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? "text-green-500" : "text-muted-foreground"}`} />
                            {autoRefresh ? "자동 갱신 켜짐" : "자동 갱신 꺼짐"}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="relative">
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel className="flex justify-between items-center">
                                    알림
                                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                                        모두 읽음
                                    </Button>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={`flex items-start gap-2 py-2 ${!notification.read ? "bg-muted/50" : ""}`}
                                    >
                                        {notification.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                                        {notification.type === "info" && <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
                                        {notification.type === "critical" && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{notification.message}</div>
                                            <div className="text-xs text-muted-foreground">{notification.time}</div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* 메인 대시보드 */}
            <main className="flex-1 p-2 overflow-hidden">
                <div className="h-full flex flex-col">
                    {/* 상태 표시줄 */}
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">마지막 업데이트:</span>
                            <span>{formatTime(lastUpdated)}</span>
                            <Badge variant="outline" className="ml-2 gap-1 flex items-center">
                <span
                    className={`w-2 h-2 rounded-full ${systemStatus.api.status === "normal" ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
                                API
                            </Badge>
                            <Badge variant="outline" className="gap-1 flex items-center">
                <span
                    className={`w-2 h-2 rounded-full ${systemStatus.database.status === "normal" ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
                                DB
                            </Badge>
                            <Badge variant="outline" className="gap-1 flex items-center">
                <span
                    className={`w-2 h-2 rounded-full ${systemStatus.prediction.status === "normal" ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
                                예측 엔진
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-7">
                                <Grid3X3 className="h-3.5 w-3.5 mr-1" />
                                위젯 관리
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7">
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                대시보드 편집
                            </Button>
                        </div>
                    </div>

                    {/* 위젯 그리드 */}
                    <div className="grid grid-cols-4 gap-2 flex-1">
                        {/* 기상 현황 위젯 */}
                        {widgets.find((w) => w.id === "weather")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "weather")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">기상 현황</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("weather")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("weather")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">{weatherData.current.temperature}°C</div>
                                        <Sun className="h-8 w-8 text-yellow-500" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                                        <div className="flex flex-col items-center">
                                            <Cloud className="h-4 w-4 mb-1" />
                                            <span>습도</span>
                                            <span className="font-medium">{weatherData.current.humidity}%</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Wind className="h-4 w-4 mb-1" />
                                            <span>풍속</span>
                                            <span className="font-medium">{weatherData.current.windSpeed}m/s</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <CloudRain className="h-4 w-4 mb-1" />
                                            <span>강수확률</span>
                                            <span className="font-medium">20%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 태양광 발전 위젯 */}
                        {widgets.find((w) => w.id === "solar")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "solar")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">태양광 발전</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("solar")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("solar")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">
                                            {generationData.solar.current} <span className="text-sm font-normal">MW</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <Badge
                                                variant={
                                                    generationData.solar.current >= generationData.solar.predicted ? "success" : "destructive"
                                                }
                                                className="gap-1 flex items-center"
                                            >
                                                {generationData.solar.current >= generationData.solar.predicted ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                )}
                                                {Math.abs((generationData.solar.current / generationData.solar.predicted) * 100 - 100).toFixed(
                                                    1,
                                                )}
                                                %
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>효율</span>
                                            <span>{generationData.solar.efficiency}%</span>
                                        </div>
                                        <Progress value={generationData.solar.efficiency} className="h-1" />
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        예측: {generationData.solar.predicted} MW | 용량: {generationData.solar.capacity} MW
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 풍력 발전 위젯 */}
                        {widgets.find((w) => w.id === "wind")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "wind")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">풍력 발전</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("wind")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("wind")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">
                                            {generationData.wind.current} <span className="text-sm font-normal">MW</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <Badge
                                                variant={
                                                    generationData.wind.current >= generationData.wind.predicted ? "success" : "destructive"
                                                }
                                                className="gap-1 flex items-center"
                                            >
                                                {generationData.wind.current >= generationData.wind.predicted ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                )}
                                                {Math.abs((generationData.wind.current / generationData.wind.predicted) * 100 - 100).toFixed(1)}
                                                %
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>효율</span>
                                            <span>{generationData.wind.efficiency}%</span>
                                        </div>
                                        <Progress value={generationData.wind.efficiency} className="h-1" />
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        예측: {generationData.wind.predicted} MW | 용량: {generationData.wind.capacity} MW
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 전력 수요 위젯 */}
                        {widgets.find((w) => w.id === "demand")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "demand")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">전력 수요</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("demand")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("demand")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">
                                            {demandData.current} <span className="text-sm font-normal">MW</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <Badge
                                                variant={demandData.current <= demandData.predicted ? "success" : "destructive"}
                                                className="gap-1 flex items-center"
                                            >
                                                {demandData.current <= demandData.predicted ? (
                                                    <ArrowDown className="h-3 w-3" />
                                                ) : (
                                                    <ArrowUp className="h-3 w-3" />
                                                )}
                                                {Math.abs((demandData.current / demandData.predicted) * 100 - 100).toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>최대 대비</span>
                                            <span>{Math.round((demandData.current / demandData.peak) * 100)}%</span>
                                        </div>
                                        <Progress value={(demandData.current / demandData.peak) * 100} className="h-1" />
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        예측: {demandData.predicted} MW | 최대: {demandData.peak} MW
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 발전량 추이 차트 */}
                        {widgets.find((w) => w.id === "generation-trend")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "generation-trend")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">발전량 추이</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("generation-trend")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("generation-trend")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="h-[120px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={generationTrendData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={25} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="solar"
                                                    stackId="1"
                                                    stroke="#f59e0b"
                                                    fill="#f59e0b"
                                                    fillOpacity={0.6}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="wind"
                                                    stackId="1"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.6}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="predicted"
                                                    stroke="#6b7280"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    strokeDasharray="5 5"
                                                />
                                                <Tooltip />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                                            <span>태양광</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                                            <span>풍력</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-[#6b7280]"></span>
                                            <span>예측</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 수요 추이 차트 */}
                        {widgets.find((w) => w.id === "demand-trend")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "demand-trend")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">수요 추이</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("demand-trend")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("demand-trend")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="h-[120px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={demandTrendData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={25} />
                                                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="predicted"
                                                    stroke="#6b7280"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    strokeDasharray="5 5"
                                                />
                                                <Tooltip />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                                            <span>실제 수요</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-[#6b7280]"></span>
                                            <span>예측 수요</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 실시간 알림 위젯 */}
                        {widgets.find((w) => w.id === "alerts")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "alerts")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">실시간 알림</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("alerts")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("alerts")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-2 max-h-[120px] overflow-y-auto">
                                        <Alert variant="warning" className="py-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle className="text-xs font-medium">태양광 발전량 급감</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                10분 전 - 태양광 발전량이 예측치 대비 20% 감소했습니다.
                                            </AlertDescription>
                                        </Alert>
                                        <Alert className="py-2">
                                            <BellRing className="h-4 w-4" />
                                            <AlertTitle className="text-xs font-medium">전력 수요 증가</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                30분 전 - 전력 수요가 예측치보다 5% 증가했습니다.
                                            </AlertDescription>
                                        </Alert>
                                        <Alert variant="default" className="py-2">
                                            <Info className="h-4 w-4" />
                                            <AlertTitle className="text-xs font-medium">기상 데이터 업데이트</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                1시간 전 - 기상 예측 데이터가 업데이트되었습니다.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 시스템 상태 위젯 */}
                        {widgets.find((w) => w.id === "status")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "status")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("status")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("status")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1">
                        <span
                            className={`w-2 h-2 rounded-full ${systemStatus.api.status === "normal" ? "bg-green-500" : "bg-yellow-500"}`}
                        ></span>
                                                <span>API 서버</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>{systemStatus.api.latency}ms</span>
                                                <Badge
                                                    variant={systemStatus.api.latency < 200 ? "outline" : "secondary"}
                                                    className="text-[10px] h-4"
                                                >
                                                    {systemStatus.api.latency < 200 ? "정상" : "지연"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1">
                        <span
                            className={`w-2 h-2 rounded-full ${systemStatus.database.status === "normal" ? "bg-green-500" : "bg-yellow-500"}`}
                        ></span>
                                                <span>데이터베이스</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>{systemStatus.database.latency}ms</span>
                                                <Badge
                                                    variant={systemStatus.database.latency < 100 ? "outline" : "secondary"}
                                                    className="text-[10px] h-4"
                                                >
                                                    {systemStatus.database.latency < 100 ? "정상" : "지연"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1">
                        <span
                            className={`w-2 h-2 rounded-full ${systemStatus.prediction.status === "normal" ? "bg-green-500" : "bg-yellow-500"}`}
                        ></span>
                                                <span>예측 엔진</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>{systemStatus.prediction.latency}ms</span>
                                                <Badge
                                                    variant={systemStatus.prediction.latency < 300 ? "outline" : "secondary"}
                                                    className="text-[10px] h-4"
                                                >
                                                    {systemStatus.prediction.latency < 300 ? "정상" : "지연"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* P2G 상태 위젯 */}
                        {widgets.find((w) => w.id === "p2g-status")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "p2g-status")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">P2G 상태</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("p2g-status")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("p2g-status")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">
                                            {p2gData.currentPower} <span className="text-sm font-normal">kW</span>
                                        </div>
                                        <Badge
                                            variant={p2gData.status === "운전중" ? "success" : "secondary"}
                                            className="gap-1 flex items-center"
                                        >
                                            {p2gData.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>변환 효율</span>
                                            <span>{p2gData.efficiency}%</span>
                                        </div>
                                        <Progress value={p2gData.efficiency} className="h-1" />
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                                        <div>
                                            <span className="text-muted-foreground">수소 생산량:</span>
                                            <span className="ml-1 font-medium">{p2gData.hydrogenProduction} kg/h</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">일일 생산량:</span>
                                            <span className="ml-1 font-medium">{p2gData.dailyProduction} kg</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 섹터커플링 현황 위젯 */}
                        {widgets.find((w) => w.id === "sector-coupling")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "sector-coupling")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">섹터커플링 현황</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("sector-coupling")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("sector-coupling")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">
                                            {sectorCouplingData.surplusPower} <span className="text-sm font-normal">kW</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <Badge variant="outline" className="gap-1 flex items-center">
                                                활용률 {sectorCouplingData.utilizationRate}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>잉여전력 분배</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 flex overflow-hidden">
                                            <div className="bg-blue-500 h-2" style={{ width: `${sectorCouplingData.p2gAllocation}%` }}></div>
                                            <div className="bg-red-500 h-2" style={{ width: `${sectorCouplingData.p2hAllocation}%` }}></div>
                                            <div
                                                className="bg-green-500 h-2"
                                                style={{ width: `${sectorCouplingData.batteryAllocation}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                                            <span>P2G ({sectorCouplingData.p2gAllocation}%)</span>
                                            <span>P2H ({sectorCouplingData.p2hAllocation}%)</span>
                                            <span>ESS ({sectorCouplingData.batteryAllocation}%)</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs">
                                        <span className="text-muted-foreground">CO₂ 저감량:</span>
                                        <span className="ml-1 font-medium">{sectorCouplingData.co2Reduction} tCO₂/일</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* DERMS 연동 위젯 */}
                        {widgets.find((w) => w.id === "derms")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "derms")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">DERMS 연동</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("derms")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("derms")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-2xl font-bold">{dermsData.connectedResources}</div>
                                            <div className="text-xs text-muted-foreground">연결된 자원</div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <Badge variant="outline" className="mb-1">
                                                {dermsData.activeResources} 활성
                                            </Badge>
                                            <div className="text-xs text-muted-foreground">마지막 동기화: {dermsData.lastSync}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>자원 활용률</span>
                                            <span>{Math.round((dermsData.currentUtilization / dermsData.totalCapacity) * 100)}%</span>
                                        </div>
                                        <Progress value={(dermsData.currentUtilization / dermsData.totalCapacity) * 100} className="h-1" />
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                                        <div>
                                            <span className="text-muted-foreground">총 용량:</span>
                                            <span className="ml-1 font-medium">{dermsData.totalCapacity} kW</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">응답 시간:</span>
                                            <span className="ml-1 font-medium">{dermsData.responseTime} 초</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* ESS 운영 전략 위젯 */}
                        {widgets.find((w) => w.id === "ess-schedule")?.visible && (
                            <Card className={`${getWidgetSizeClass(widgets.find((w) => w.id === "ess-schedule")?.size)}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium">ESS 운영 전략</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <RadixTooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => toggleWidgetSize("ess-schedule")}
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>위젯 크기 변경</p>
                                                </TooltipContent>
                                            </RadixTooltip>
                                        </TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleWidgetVisibility("ess-schedule")}>
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                    <span>숨기기</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>새로고침</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <div className="text-sm font-medium">
                                                현재 SOC: <span className="text-lg">{essData.currentSOC}%</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">운영 전략: {essData.strategy}</div>
                                        </div>
                                        <Badge variant="outline" className="gap-1 flex items-center">
                                            일일 절감액: {essData.dailySavings}백만원
                                        </Badge>
                                    </div>

                                    <div className="h-[100px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={essScheduleData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={25} />
                                                <YAxis
                                                    yAxisId="right"
                                                    orientation="right"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fontSize: 10 }}
                                                    width={25}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="charge"
                                                    stroke="#4f46e5"
                                                    fill="#4f46e5"
                                                    fillOpacity={0.6}
                                                    yAxisId="left"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="discharge"
                                                    stroke="#ef4444"
                                                    fill="#ef4444"
                                                    fillOpacity={0.6}
                                                    yAxisId="left"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="soc"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    yAxisId="right"
                                                    dot={{ r: 2 }}
                                                />
                                                <Tooltip />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-2 text-xs">
                                        <div className="flex justify-between mb-1">
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-[#4f46e5]"></span>
                                                <span>충전</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                                                <span>방전</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                                                <span>SOC</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <div>
                                                <div className="text-muted-foreground">최적 충전 시간:</div>
                                                <div className="font-medium">{essData.optimalChargeTime.join(", ")}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">최적 방전 시간:</div>
                                                <div className="font-medium">{essData.optimalDischargeTime.join(", ")}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 위젯 추가 버튼 */}
                        <Button variant="outline" className="h-full flex flex-col items-center justify-center gap-2 border-dashed">
                            <Plus className="h-6 w-6" />
                            <span>위젯 추가</span>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}

