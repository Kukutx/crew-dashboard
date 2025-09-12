import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';

const ReportsPage: React.FC = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default ReportsPage;
