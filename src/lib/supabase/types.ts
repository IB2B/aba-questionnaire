export type UserRole = "admin" | "client"
export type ResponseStatus = "in_progress" | "submitted"

/** A file answer: either something uploaded to Storage, or a pasted link. */
export type FileAnswer =
  | { kind: "upload"; path: string; name: string }
  | { kind: "link"; url: string }

/** One row of a repeatable question, keyed by the repeater's field ids. */
export type RepeaterRow = Record<string, string>

/** Answers are keyed by question id; shape depends on the question type. */
export type AnswerValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | FileAnswer
  | RepeaterRow[]

export type AnswerMap = Record<string, AnswerValue>

export type Profile = {
  id: string
  email: string
  full_name: string | null
  company: string | null
  role: UserRole
  created_at: string
}

export type QuestionnaireResponse = {
  id: string
  user_id: string
  status: ResponseStatus
  answers: AnswerMap
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export type ResponseWithProfile = QuestionnaireResponse & {
  profiles: Pick<Profile, "id" | "email" | "full_name" | "company"> | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at"> & { created_at?: string }
        Update: Partial<Omit<Profile, "id">>
        Relationships: []
      }
      responses: {
        Row: QuestionnaireResponse
        Insert: Omit<
          QuestionnaireResponse,
          "id" | "created_at" | "updated_at" | "submitted_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
          submitted_at?: string | null
        }
        Update: Partial<Omit<QuestionnaireResponse, "id" | "user_id">>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      response_status: ResponseStatus
    }
    CompositeTypes: Record<string, never>
  }
}
