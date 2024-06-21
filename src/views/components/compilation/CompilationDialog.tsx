import { Dialog } from '@components/Dialog';
import React from 'react';
import { useTranslation } from 'react-i18next';

type CompilationDialogProps = {
  closeDialog: () => void;
};

export const CompilationDialog = ({ closeDialog }: CompilationDialogProps) => {
  //const { t } = useTranslation('compilation');

  return (
    <Dialog title={"Création d'une version jouable"} closeDialog={closeDialog}>
      <span>TODO</span>
    </Dialog>
  );
};
