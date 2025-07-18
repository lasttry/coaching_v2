import React, { ReactElement } from 'react';
import Head from 'next/head';
import { ReactNode } from 'react';

type Props = {
  description?: string;
  children: ReactNode;
  title?: string;
};

const PageContainer = ({ title, description, children }: Props): ReactElement => (
  <div>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
    {children}
  </div>
);

export default PageContainer;
