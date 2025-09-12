import { PageContainer } from '@ant-design/pro-components';
import EventsTable from './components/EventsTable';

const EventsPage: React.FC = () => {
  return (
    <PageContainer>
      <EventsTable />
    </PageContainer>
  );
};

export default EventsPage;
