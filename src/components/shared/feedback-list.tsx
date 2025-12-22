'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllFeedback } from '@/services/feedbackService';
import { Feedback, FeedbackType } from '@/types/feedback';
import { Bug, Lightbulb, Heart, MessageSquare, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const feedbackTypeIcons = {
  [FeedbackType.BUG]: Bug,
  [FeedbackType.SUGGESTION]: Lightbulb,
  [FeedbackType.COMPLIMENT]: Heart,
  [FeedbackType.OTHER]: MessageSquare,
};

const feedbackTypeColors = {
  [FeedbackType.BUG]: 'bg-red-500/10 text-red-500 border-red-500/30',
  [FeedbackType.SUGGESTION]: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  [FeedbackType.COMPLIMENT]: 'bg-green-500/10 text-green-500 border-green-500/30',
  [FeedbackType.OTHER]: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
};

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await getAllFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum feedback ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => {
        const Icon = feedbackTypeIcons[feedback.type];
        const colorClass = feedbackTypeColors[feedback.type];

        return (
          <Card key={feedback.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{feedback.visitor_name}</span>
                        <Badge variant="outline" className={colorClass}>
                          {feedback.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feedback.context} • {feedback.created_at && formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= feedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-foreground">{feedback.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
