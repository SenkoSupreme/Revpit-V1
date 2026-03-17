export type PitRole = 'member' | 'pit_boss' | 'admin'
export type DropType = 'text' | 'image' | 'video' | 'poll' | 'build_update'
export type VoteType = 'rev' | 'idle'
export type DropTag = 'Build Update' | 'Question' | 'Event' | 'News' | 'Meme' | 'Discussion'
export type TrophyType = 'gold_wrench' | 'fire_build' | 'big_brain' | 'daily_driver'
export type FeedSort = 'hot' | 'new' | 'top' | 'rising'

export type Pit = {
  id: string
  name: string
  display_name: string
  description: string | null
  banner_url: string | null
  icon_url: string | null
  created_by: string | null
  member_count: number
  is_official: boolean
  created_at: string
}

export type Drop = {
  id: string
  pit_id: string
  author_id: string
  title: string
  body: string | null
  type: DropType
  media_urls: string[] | null
  poll_options: PollOption[] | null
  tag: DropTag | null
  rev_count: number
  idle_count: number
  reply_count: number
  score: number
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  // joined
  author?: DropAuthor
  pit?: Pick<Pit, 'name' | 'display_name'>
  user_vote?: VoteType | null
}

export type PollOption = {
  id: string
  option: string
  votes: number
}

export type DropAuthor = {
  username: string
  avatar_url: string | null
  score: number
  tier: string
}

export type Reply = {
  id: string
  drop_id: string
  author_id: string
  parent_reply_id: string | null
  body: string
  rev_count: number
  created_at: string
  author?: DropAuthor
  children?: Reply[]
}

export type Trophy = {
  id: string
  drop_id: string
  given_by: string
  trophy_type: TrophyType
  created_at: string
}
