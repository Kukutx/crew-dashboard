import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';
import SchedulePlaceholder from './components';

const SchedulePage: React.FC = () => {
  return (
    <PageContainer>
      <SchedulePlaceholder />
      <Outlet />
    </PageContainer>
  );
};

export default SchedulePage;
