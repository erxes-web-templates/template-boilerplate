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
    $_id: String!
    $email: String
    $firstName: String
    $lastName: String
    $phone: String
    $username: String
    $companyName: String
    $companyRegistrationNumber: String
    $avatar: String
    $erxesCustomerId: String
  ) {
    clientPortalUserEdit(
      _id: $_id
      email: $email
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      username: $username
      companyName: $companyName
      companyRegistrationNumber: $companyRegistrationNumber
      avatar: $avatar
      erxesCustomerId: $erxesCustomerId
    ) {
      _id
    }
  }
`;

const changePhone = gql`
  mutation changePhone($_id: String!, $phone: String) {
    clientPortalUserEdit(_id: $_id, phone: $phone) {
      _id
    }
  }
`;

const userChangePassword = gql`
  mutation cpUsersSetPassword($_id: String!, $newPassword: String!) {
    cpUsersSetPassword(_id: $_id, newPassword: $newPassword) {
      _id
    }
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
