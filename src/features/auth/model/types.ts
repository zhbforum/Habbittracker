export type AuthMode = "signIn" | "signUp";

export type SignInFormValues = {
  email: string;
  password: string;
};

export type SignUpFormValues = {
  fullName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};

export type AuthFeedbackState =
  | {
      kind: "idle";
      message: "";
    }
  | {
      kind: "success" | "error";
      message: string;
    };

export type AuthActionResult =
  | {
      status: "success";
      message: string;
      requiresEmailConfirmation?: boolean;
    }
  | {
      status: "error";
      message: string;
    };

export type OAuthActionResult =
  | {
      status: "success" | "pending";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };
