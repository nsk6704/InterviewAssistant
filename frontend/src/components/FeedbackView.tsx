import type { FeedbackResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import LaptopIcon from '@mui/icons-material/Laptop';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

interface Props {
    feedback: FeedbackResponse;
    onNewInterview: () => void;
}

export default function FeedbackView({ feedback, onNewInterview }: Props) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
            <Card className="w-full max-w-4xl shadow-2xl border-blue-100">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg">
                            <CheckCircleIcon sx={{ fontSize: 28, color: 'white' }} />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                Interview Complete
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                Here's your detailed performance feedback
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <Separator className="mb-6" />

                <CardContent className="space-y-8">
                    {/* Performance Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Technical Score */}
                        <Card className="border-2 border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <LaptopIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                                    Technical Knowledge
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-blue-600">{feedback.technical_score}</span>
                                    <span className="text-lg text-muted-foreground mb-1">/100</span>
                                </div>
                                <Progress value={feedback.technical_score} className="h-3 bg-blue-100" />
                                <p className="text-xs text-muted-foreground">
                                    {feedback.technical_score >= 80 ? 'Excellent performance' : feedback.technical_score >= 60 ? 'Good progress' : 'Room for improvement'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Communication Score */}
                        <Card className="border-2 border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <ChatBubbleIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                                    Communication
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-blue-600">{feedback.communication_score}</span>
                                    <span className="text-lg text-muted-foreground mb-1">/100</span>
                                </div>
                                <Progress value={feedback.communication_score} className="h-3 bg-blue-100" />
                                <p className="text-xs text-muted-foreground">
                                    {feedback.communication_score >= 80 ? 'Excellent performance' : feedback.communication_score >= 60 ? 'Good progress' : 'Room for improvement'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    {/* Strengths */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                                <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Strengths</h3>
                        </div>
                        <div className="space-y-3">
                            {feedback.strengths.map((strength, idx) => (
                                <Card key={idx} className="border-2 border-green-100 bg-gradient-to-r from-green-50/50 to-white shadow-sm">
                                    <CardContent className="py-4">
                                        <p className="text-sm text-card-foreground leading-relaxed">{strength}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Areas for Improvement */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center">
                                <TrendingUpIcon sx={{ fontSize: 20, color: 'white' }} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Areas for Improvement</h3>
                        </div>
                        <div className="space-y-3">
                            {feedback.improvements.map((improvement, idx) => (
                                <Card key={idx} className="border-2 border-orange-100 bg-gradient-to-r from-orange-50/50 to-white shadow-sm">
                                    <CardContent className="py-4">
                                        <p className="text-sm text-card-foreground leading-relaxed">{improvement}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Overall Feedback */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                                <StarIcon sx={{ fontSize: 20, color: 'white' }} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Overall Assessment</h3>
                        </div>
                        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
                            <CardContent className="py-6">
                                <p className="text-base text-card-foreground leading-relaxed">{feedback.overall_feedback}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <Button
                            onClick={onNewInterview}
                            size="lg"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                        >
                            <RefreshIcon sx={{ fontSize: 20, marginRight: 0.5 }} />
                            Start New Interview
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
