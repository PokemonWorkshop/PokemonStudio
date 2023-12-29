import { PageTemplate } from '@components/pages';
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type DashboardTemplateProps = {
  title: string;
  children: ReactNode | ReactNode[];
};

export const DashboardTemplate = ({ title, children }: DashboardTemplateProps) => {
  const navigate = useNavigate();
  return (
    <PageTemplate title={title} size="default" onClickBack={() => navigate('/dashboard')}>
      {children}
    </PageTemplate>
  );
};
