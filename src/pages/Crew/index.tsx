import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';
import CrewPlaceholder from './components';

const CrewPage: React.FC = () => {
  return (
    <PageContainer>
      <CrewPlaceholder />
      <Outlet />
    </PageContainer>
  );
};

export default CrewPage;
