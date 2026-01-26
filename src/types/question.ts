export interface Question {
  id: number;
  category: string;
  subcategory: string | null;
  question: string;
  answer: string;
  asked: boolean;
}

export interface CategoryCount {
  category: string;
  total: number;
  remaining: number;
}

export interface QuestionResponse {
  question: Question | null;
  remaining: number;
  total: number;
}
