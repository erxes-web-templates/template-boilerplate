import { gql } from "@apollo/client";

export const CP_SYNC_CONFIG = gql`
  mutation CpSyncConfig($type: String!) {
    cpSyncConfig(type: $type)
  }
`;

export const FORM_SUBMISSION = gql`
  mutation WidgetsSaveLead($formId: String!, $browserInfo: JSON!, $submissions: [FieldValueInput]) {
    widgetsSaveLead(formId: $formId, browserInfo: $browserInfo, submissions: $submissions) {
      status
    }
  }
`;
