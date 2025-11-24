import { useState } from 'react';
import type { InterviewConfig } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface Props {
    onStart: (config: InterviewConfig) => void;
}

export default function InterviewSetup({ onStart }: Props) {
    const [role, setRole] = useState('Software Engineer');
    const [difficulty, setDifficulty] = useState('Medium');
    const [resumeText, setResumeText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart({ role, difficulty, resume_text: resumeText });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
            <Card className="w-full max-w-2xl shadow-2xl border-blue-100">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                            <CheckCircleIcon sx={{ fontSize: 28, color: 'white' }} />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold text-blue-600">
                                Interview Practice Partner
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                Prepare for your dream role with AI-powered mock interviews
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <Separator className="mb-6" />

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-semibold">
                                Interview Role
                            </Label>
                            <Input
                                id="role"
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g., Software Engineer, Data Scientist"
                                required
                                className="h-11"
                            />
                        </div>

                        {/* Difficulty Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="difficulty" className="text-sm font-semibold">
                                Difficulty Level
                            </Label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy - Entry Level</SelectItem>
                                    <SelectItem value="Medium">Medium - Mid Level</SelectItem>
                                    <SelectItem value="Hard">Hard - Senior Level</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Resume Context */}
                        <div className="space-y-2">
                            <Label htmlFor="resume" className="text-sm font-semibold">
                                Resume/Context (Optional)
                            </Label>
                            <Textarea
                                id="resume"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                rows={6}
                                placeholder="Paste your resume or key experience highlights here for a personalized interview..."
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                This helps the AI tailor questions to your background
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                            size="lg"
                        >
                            <span>Start Interview</span>
                            <ArrowForwardIcon sx={{ fontSize: 20, marginLeft: 1 }} />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
