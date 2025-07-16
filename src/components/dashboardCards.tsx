// // src/components/DashboardCards.tsx
// import React from 'react';
// import { Box, Typography } from '@mui/material';
// import GroupIcon from '@mui/icons-material/Group';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import CancelIcon from '@mui/icons-material/Cancel';

// interface DashboardCardsProps {
//   totalStudents: number;
//   attended: number;
//   absent: number;
// }

// const DashboardCards: React.FC<DashboardCardsProps> = ({ totalStudents, attended, absent }) => {
//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         gap: 2,
//         mb: 3,
//         flexWrap: 'wrap',
//       }}
//     >
//       <Box
//         sx={{
//           flex: '1 1 200px',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           bgcolor: '#e3f2fd',
//           p: 2,
//           borderRadius: 2,
//           boxShadow: 1,
//         }}
//       >
//         <Box>
//           <Typography variant="body1" fontWeight={600}>Toplam Öğrenci</Typography>
//           <Typography variant="h6">{totalStudents}</Typography>
//         </Box>
//         <GroupIcon sx={{ fontSize: 40, color: '#1976d2' }} />
//       </Box>

//       <Box
//         sx={{
//           flex: '1 1 200px',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           bgcolor: '#e8f5e9',
//           p: 2,
//           borderRadius: 2,
//           boxShadow: 1,
//         }}
//       >
//         <Box>
//           <Typography variant="body1" fontWeight={600}>Katılan</Typography>
//           <Typography variant="h6">{attended}</Typography>
//         </Box>
//         <CheckCircleIcon sx={{ fontSize: 40, color: '#43a047' }} />
//       </Box>

//       <Box
//         sx={{
//           flex: '1 1 200px',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           bgcolor: '#ffebee',
//           p: 2,
//           borderRadius: 2,
//           boxShadow: 1,
//         }}
//       >
//         <Box>
//           <Typography variant="body1" fontWeight={600}>Katılmayan</Typography>
//           <Typography variant="h6">{absent}</Typography>
//         </Box>
//         <CancelIcon sx={{ fontSize: 40, color: '#e53935' }} />
//       </Box>
//     </Box>
//   );
// };

// export default DashboardCards;



// src/components/DashboardCards.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface DashboardCardsProps {
  totalStudents: number;
  attended: number;
  late: number;
  absent: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ totalStudents, attended, late, absent }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          flex: '1 1 220px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#e3f2fd',
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box>
          <Typography variant="body1" fontWeight={600}>Toplam Öğrenci</Typography>
          <Typography variant="h6">{totalStudents}</Typography>
        </Box>
        <GroupIcon sx={{ fontSize: 40, color: '#1976d2' }} />
      </Box>

      <Box
        sx={{
          flex: '1 1 220px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#e8f5e9',
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box>
          <Typography variant="body1" fontWeight={600}>Katılan</Typography>
          <Typography variant="h6">{attended}</Typography>
        </Box>
        <CheckCircleIcon sx={{ fontSize: 40, color: '#43a047' }} />
      </Box>

      <Box
        sx={{
          flex: '1 1 220px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#fffde7',
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box>
          <Typography variant="body1" fontWeight={600}>Geç Kaldı</Typography>
          <Typography variant="h6">{late}</Typography>
        </Box>
        <AccessTimeIcon sx={{ fontSize: 40, color: '#f9a825' }} />
      </Box>

      <Box
        sx={{
          flex: '1 1 220px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#ffebee',
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box>
          <Typography variant="body1" fontWeight={600}>Katılmayan</Typography>
          <Typography variant="h6">{absent}</Typography>
        </Box>
        <CancelIcon sx={{ fontSize: 40, color: '#e53935' }} />
      </Box>
    </Box>
  );
};

export default DashboardCards;

