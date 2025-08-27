import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  MenuItem,
  Menu,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { getAllTerms, getCoursesByTerm } from "../services/authService";

interface Props {
  onCourseSelect: (courseId: string) => void;
  onScheduleClick: () => void;
  selectedTerm: string;
  onTermChange: (term: string) => void;
}

const PrimarySearchAppBar: React.FC<Props> = ({
  onCourseSelect,
  onScheduleClick,
  selectedTerm,
  onTermChange,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [terms, setTerms] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const isProfileMenuOpen = Boolean(profileMenuAnchorEl);
  const navigate = useNavigate();

  const getDefaultTerm = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (month >= 2 && month <= 6) return `${year} Bahar`;
    if (month >= 9 && month <= 12) return `${year} Güz`;
    return `${year} Yaz`;
  };

  useEffect(() => {
    const fetchTerms = async () => {
      const result = await getAllTerms();
      setTerms(result);

      if (!selectedTerm) onTermChange(getDefaultTerm());
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (selectedTerm) {
      const fetchCourses = async () => {
        const result = await getCoursesByTerm(selectedTerm);
        setCourses(result);

        if (result.length > 0) {
          setSelectedCourseId(result[0].id);
          onCourseSelect(result[0].id);
        } else {
          setSelectedCourseId("");
          onCourseSelect("");
        }
      };
      fetchCourses();
    } else {
      setCourses([]);
      setSelectedCourseId("");
      onCourseSelect("");
    }
  }, [selectedTerm]);

  const handleCourseSelect = (id: string) => {
    setSelectedCourseId(id);
    onCourseSelect(id);
    navigate(`/dashboard/courseStudents/${id}`);
    setDrawerOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setProfileMenuAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
    navigate("/dashboard/profile");
  };
  const handleLogoutClick = () => {
    handleProfileMenuClose();
    navigate("/");
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: "#1976d2", py: 1 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            size="large"
            color="inherit"
            onClick={() => navigate("/dashboard")}
          >
            <HomeIcon />
          </IconButton>

          <Avatar
            src="/logo.png"
            alt="Logo"
            sx={{ width: 48, height: 48, mr: 2, ml: 3 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Akıllı Yoklama Sistemi</Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              Öğrenci Devam Takip Platformu
            </Typography>
          </Box>

          <Select
            value={selectedTerm}
            onChange={(e) => onTermChange(e.target.value)}
            displayEmpty
            size="small"
            sx={{
              mx: 2,
              backgroundColor: "white",
              borderRadius: 1,
              minWidth: 150,
              "& .MuiSelect-select": { py: 0.8, px: 1.5 },
            }}
          >
            <MenuItem disabled value="">
              <em>Dönem Seç</em>
            </MenuItem>
            {terms.map((term) => (
              <MenuItem key={term} value={term}>
                {term}
              </MenuItem>
            ))}
          </Select>

          <IconButton size="large" color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <ListItemButton
            onClick={() => {
              onScheduleClick();
              navigate("/dashboard/schedule");
              setDrawerOpen(false);
            }}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              mb: 2,
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>Ders Programı</Typography>
          </ListItemButton>

          <Accordion
            defaultExpanded
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              "&:before": { display: "none" },
              mb: 2,
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "bold" }}>İstatistikler</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List>
                <ListItemButton
                  onClick={() => {
                    onScheduleClick();
                    navigate("/dashboard/statistics/course");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="📊 Ders İstatistikleri" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    onScheduleClick();
                    navigate("/dashboard/statistics/student");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="👤 Öğrenci İstatistikleri" />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>

          <ListItemButton
            onClick={() => {
              onScheduleClick();
              navigate("/dashboard/attendanceByDate");
              setDrawerOpen(false);
            }}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              mb: 2,
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>Yoklama Geçmişi</Typography>
          </ListItemButton>

          <Accordion
            defaultExpanded
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "bold" }}>Yoklama Al</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <ListItemButton
                      key={course.id}
                      onClick={() => handleCourseSelect(course.id)}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        backgroundColor:
                          selectedCourseId === course.id
                            ? "#e0e0e0"
                            : "transparent",
                      }}
                    >
                      <ListItemText
                        primary={`${course.name} (${course.code})`}
                      />
                    </ListItemButton>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ px: 2, py: 1, color: "gray" }}
                  >
                    Ders bulunamadı
                  </Typography>
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Drawer>

      <Menu
        anchorEl={profileMenuAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            borderRadius: 1,
          },
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>Profilim</MenuItem>
        <MenuItem onClick={handleLogoutClick}>Çıkış Yap</MenuItem>
      </Menu>
    </Box>
  );
};

export default PrimarySearchAppBar;
