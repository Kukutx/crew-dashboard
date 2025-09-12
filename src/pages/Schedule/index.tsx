import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';

const SchedulePage: React.FC = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default SchedulePage;
