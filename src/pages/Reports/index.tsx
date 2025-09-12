import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';
import ReportsPlaceholder from './components';

const ReportsPage: React.FC = () => {
  return (
    <PageContainer>
      <ReportsPlaceholder />
      <Outlet />
    </PageContainer>
  );
};

export default ReportsPage;
