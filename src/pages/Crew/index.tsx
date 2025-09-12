import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';

const CrewPage: React.FC = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default CrewPage;
