export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export interface ConsensusPoint {
  time: string; // ISO date string
  value: number;
}

export interface FragmentBranch {
  id: string;
  time: string; // ISO date string
  userCount: number;
  branch: number; // 0, 1, or 2 for up to 3 branches
}

export interface GroupData {
  consensus: ConsensusPoint[];
  fragments: FragmentBranch[];
}
