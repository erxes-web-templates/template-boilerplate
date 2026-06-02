import { gql } from "@apollo/client";

const login = gql`
  mutation ClientPortalUserLoginWithCredentials(
    $email: String
    $phone: String
    $password: String
  ) {
    clientPortalUserLoginWithCredentials(
      email: $email
      phone: $phone
      password: $password
    )
  }
`;

const createUser = gql`
  mutation ClientPortalUserRegister(
    $email: String
    $phone: String
    $username: String
    $password: String
    $firstName: String
    $lastName: String
    $userType: CPUserType
    $code: String
    $propertiesData: JSON
  ) {
    clientPortalUserRegister(
      email: $email
      phone: $phone
      username: $username
      password: $password
      firstName: $firstName
      lastName: $lastName
      userType: $userType
      code: $code
      propertiesData: $propertiesData
    ) {
      _id
    }
  }
`;

const logout = gql`
  mutation {
    clientPortalLogout
  }
`;

const getCode = gql`
  mutation sendVerificationCode($phone: String!) {
    sendVerificationCode(phone: $phone)
  }
`;
const resetPassword = gql`
  mutation ClientPortalUserResetPassword(
    $newPassword: String!
    $token: String
    $identifier: String
    $code: String
  ) {
    clientPortalUserResetPassword(
      newPassword: $newPassword
      token: $token
      identifier: $identifier
      code: $code
    )
  }
`;

const forgotPassword = gql`
  mutation ClientPortalUserForgotPassword($identifier: String!) {
    clientPortalUserForgotPassword(identifier: $identifier)
  }
`;

const userEdit = gql`
  mutation clientPortalUserEdit(
    $email: String
    $phone: String
    $firstName: String
    $lastName: String
    $avatar: String
    $username: String
    $companyName: String
    $companyRegistrationNumber: String
  ) {
    clientPortalUserEdit(
      email: $email
      phone: $phone
      firstName: $firstName
      lastName: $lastName
      avatar: $avatar
      username: $username
      companyName: $companyName
      companyRegistrationNumber: $companyRegistrationNumber
    ) {
      _id
    }
  }
`;

const changePhone = gql`
  mutation changePhone($phone: String) {
    clientPortalUserEdit(phone: $phone) {
      _id
    }
  }
`;

const customerEdit = gql`
  mutation clientPortalCustomerEdit(
    $firstName: String
    $lastName: String
    $primaryEmail: String
    $primaryPhone: String
  ) {
    clientPortalCustomerEdit(
      firstName: $firstName
      lastName: $lastName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
    ) {
      _id
    }
  }
`;

const userChangePassword = gql`
  mutation ClientPortalUserChangePassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    clientPortalUserChangePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    )
  }
`;
const userVerify = gql`
  mutation ClientPortalVerifyOTP($userId: String!, $emailOtp: String) {
    clientPortalVerifyOTP(userId: $userId, emailOtp: $emailOtp)
  }
`;

const posChooseConfig = gql`
  mutation PosChooseConfig($token: String!) {
    posChooseConfig(token: $token)
  }
`;

const fbLogin = gql`
  mutation ClientPortalFacebookAuthentication(
    $clientPortalId: String!
    $accessToken: String!
  ) {
    clientPortalFacebookAuthentication(
      clientPortalId: $clientPortalId
      accessToken: $accessToken
    )
  }
`;

const googleLogin = gql`
  mutation ClientPortalGoogleAuthentication(
    $clientPortalId: String!
    $code: String!
  ) {
    clientPortalGoogleAuthentication(
      clientPortalId: $clientPortalId
      code: $code
    )
  }
`;

const socialPayLogin = gql`
  mutation clientPortalLoginWithSocialPay(
    $clientPortalId: String!
    $token: String!
  ) {
    clientPortalLoginWithSocialPay(
      clientPortalId: $clientPortalId
      token: $token
    )
  }
`;

const mutations = {
  login,
  logout,
  createUser,
  getCode,
  userEdit,
  customerEdit,
  resetPassword,
  userChangePassword,
  forgotPassword,
  userVerify,
  posChooseConfig,
  fbLogin,
  googleLogin,
  changePhone,
  socialPayLogin,
};

export default mutations;
