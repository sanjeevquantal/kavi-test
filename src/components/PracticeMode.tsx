
import React, { useState, useEffect, useRef } from 'react';
import { Story, PRACTICE_QUESTIONS } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Mic, MicOff, RefreshCw, ThumbsUp, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface PracticeModeProps {
  story: Story;
  onFinish: () => void;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ story, onFinish }) => {
  const [activeTab, setActiveTab] = useState('question');
  const [recordingMode, setRecordingMode] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState('');
  const [completedPractice, setCompletedPractice] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    // Get a random question or one related to the principle
    const getRandomQuestion = () => {
      const randomIndex = Math.floor(Math.random() * PRACTICE_QUESTIONS.length);
      return PRACTICE_QUESTIONS[randomIndex];
    };
    
    setPracticeQuestion(getRandomQuestion());
  }, [story.principle]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Here you could save or process the audio
        toast.success("Recording saved successfully!");
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all audio tracks to release microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * PRACTICE_QUESTIONS.length);
    setPracticeQuestion(PRACTICE_QUESTIONS[randomIndex]);
    setActiveTab('question');
    setRecordingMode(false);
    setAnswer('');
    stopRecording();
  };

  const handleFinishPractice = () => {
    stopRecording();
    setCompletedPractice(true);
  };

  const handleWrittenAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  const handleStartPractice = () => {
    setRecordingMode(true);
    setActiveTab('story');
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {!completedPractice ? (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="question">Question</TabsTrigger>
              <TabsTrigger value="story">Your Story</TabsTrigger>
            </TabsList>
            <TabsContent value="question" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Practice Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-medium">{practiceQuestion}</p>
                  <div className="mt-4 p-3 bg-accent rounded-md">
                    <p className="text-sm font-medium">Principle: {story.principle}</p>
                  </div>
                  
                  {!recordingMode && (
                    <div className="mt-6">
                      <Button 
                        className="w-full" 
                        onClick={handleStartPractice}
                      >
                        <Play size={16} className="mr-2" />
                        Start Practicing
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleNewQuestion}>
                    <RefreshCw size={16} className="mr-2" />
                    New Question
                  </Button>
                  <Button onClick={() => setActiveTab('story')}>
                    View Story <ChevronRight size={16} className="ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="story" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your STAR Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Situation</h3>
                    <p className="text-sm">{story.situation}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Task</h3>
                    <p className="text-sm">{story.task}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Action</h3>
                    <p className="text-sm">{story.action}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Result</h3>
                    <p className="text-sm">{story.result}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('question')}>
                    <ChevronLeft size={16} className="mr-2" />
                    Back to Question
                  </Button>
                  {recordingMode ? (
                    <Button onClick={handleRecordToggle} variant={isRecording ? "destructive" : "default"}>
                      {isRecording ? (
                        <>
                          <Pause size={16} className="mr-2" />
                          Stop Recording ({formatTime(recordingTime)})
                        </>
                      ) : (
                        <>
                          <Mic size={16} className="mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleStartPractice}>
                      <Play size={16} className="mr-2" />
                      Start Practice
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {recordingMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Answer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className={`border ${isRecording ? 'border-red-500 animate-pulse' : 'border-input'} rounded-md p-4`}>
                        {isRecording ? (
                          <div className="flex items-center justify-center py-2">
                            <Mic size={24} className="text-red-500 mr-2" />
                            <span>Recording... {formatTime(recordingTime)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-2">
                            <MicOff size={24} className="text-muted-foreground mr-2" />
                            <span className="text-muted-foreground">Not recording</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="written-answer" className="block text-sm font-medium mb-2">
                          Or type your answer:
                        </label>
                        <Textarea 
                          id="written-answer"
                          placeholder="Type your practice answer here..."
                          value={answer}
                          onChange={handleWrittenAnswerChange}
                          rows={6}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={handleFinishPractice}
                      disabled={!answer && !isRecording && audioChunks.current.length === 0}
                    >
                      Finish Practice
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="text-center py-8 animate-fade-in">
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <ThumbsUp size={48} className="text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold">Great Practice!</h2>
            <p className="text-muted-foreground">
              You've completed this practice session. Keep practicing to improve your interview skills.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleNewQuestion}>
              Practice Again
            </Button>
            <Button onClick={onFinish}>
              Back to Stories
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PracticeMode;
