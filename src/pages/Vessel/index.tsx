import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';
import VesselPlaceholder from './components';

const VesselPage: React.FC = () => {
  return (
    <PageContainer>
      <VesselPlaceholder />
      <Outlet />
    </PageContainer>
  );
};

export default VesselPage;
