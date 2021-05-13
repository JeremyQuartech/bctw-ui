import { IUpsertPayload } from 'api/api_interfaces';

/**
 * enable components to set the sidebar content
*/
type PageProp = {
  setSidebarContent?: (component: JSX.Element) => void;
}

/**
 * @param open displays or hides the modal
 * @param handleClose parent handler when modal is closed
 * @param title modal title string
*/
type ModalBaseProps = {
  open: boolean;
  handleClose: (v: boolean) => void;
  title?: string;
};

/**
 * 
*/
type ModalProps = ModalBaseProps & {
  children: React.ReactNode;
}

/**
 * @param editing an instance of T
 * @param onSave parent save handler
*/
type EditModalBaseProps<T> = ModalBaseProps & {
  editing: T;
  onSave: (c: IUpsertPayload<T>) => void;
};

/**
 * @param isEdit boolean representing whether the modal is adding a new T or editing
 * @param validateFailed a function handled in the ModifyWrapper that can display notifications
*/
type CritterCollarModalProps<T> = EditModalBaseProps<T> & {
  isEdit?: boolean;
  validateFailed?: (errors: Record<string, unknown>) => void;
};

type ConfirmModalProps = ModalBaseProps & {
  btnNoText?: string;
  btnYesText?: string;
  message: string;
  handleClickYes: (v) => void;
};

type ExportImportProps = ModalBaseProps & {
  message?: string;
  downloadTemplate?: () => void;
};

type InputChangeHandler = (o: Record<string, string | number | boolean>) => void;
type CheckBoxChangeHandler = (o: Record<string, boolean>) => void;

/**
 * @param propName property name of T, used for label
*/

interface INotificationMessage {
  message: string;
  type: 'error' | 'success' | 'none';
}

export type {
  CritterCollarModalProps,
  ModalProps,
  ModalBaseProps,
  ExportImportProps,
  EditModalBaseProps,
  INotificationMessage,
  ConfirmModalProps,
  PageProp,
  CheckBoxChangeHandler,
  InputChangeHandler,
};