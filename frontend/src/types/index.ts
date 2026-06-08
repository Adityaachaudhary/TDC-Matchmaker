export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  age: number;
  country: string;
  city: string;
  height: number;
  email: string;
  phone: string;
  college: string;
  degree: string;
  income: number;
  company: string;
  designation: string;
  maritalStatus: 'never_married' | 'divorced' | 'widowed';
  languages: string[];
  siblings: number;
  caste: string;
  religion: string;
  wantKids: 'yes' | 'no' | 'maybe';
  openToRelocate: 'yes' | 'no' | 'maybe';
  openToPets: 'yes' | 'no' | 'maybe';
  familyType: 'nuclear' | 'joint';
  diet: 'vegetarian' | 'non-vegetarian' | 'eggetarian';
  smoking: boolean;
  drinking: boolean;
  manglik: boolean;
  motherTongue: string;
  complexion: string;
  bodyType: string;
  annualIncomeBracket: string;
  profilePhoto: string;
  status: 'active' | 'on_hold' | 'matched' | 'paused';
  assignedMatchmaker: string;
  notes: string;
}

export interface Matchmaker {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePhoto?: string;
}

export interface MatchCandidate {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  city: string;
  height: number;
  income: number;
  annualIncomeBracket: string;
  company: string;
  designation: string;
  college: string;
  degree: string;
  religion: string;
  caste: string;
  maritalStatus: string;
  languages: string[];
  diet: string;
  wantKids: string;
  openToRelocate: string;
  openToPets: string;
  familyType: string;
  motherTongue: string;
  complexion: string;
  bodyType: string;
  profilePhoto: string;
  manglik: boolean;
}

export interface Match {
  candidate: MatchCandidate;
  score: number;
  label: string;
  tier: 'exceptional' | 'high' | 'good' | 'possible' | 'low';
  reasons: string[];
  redFlags: string[];
}

export interface Note {
  id: string;
  customerId: string;
  matchmakerId: string;
  matchmakerName: string;
  text: string;
  createdAt: string;
}
