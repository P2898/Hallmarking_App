export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  PendingApproval: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyListings: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  ListingDetail: { id: string };
  MakeOffer: { id: string };
  IndividualChat: { id: string };
  CreateListing: undefined;
  SearchFilterModal: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  Terms: undefined;
  DeleteAccount: undefined;
};
