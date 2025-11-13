import React from 'react'
import {
  Box,
  Button,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  IconButton,
  Avatar,
  Stack,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SaveIcon from '@mui/icons-material/Save'
import FolderIcon from '@mui/icons-material/Folder'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import BarChartIcon from '@mui/icons-material/BarChart'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CircleIcon from '@mui/icons-material/Circle'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LogoutIcon from '@mui/icons-material/Logout'
import InfoIcon from '@mui/icons-material/Info'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ThemeToggle from './ThemeToggle'
import SaveIndicator from './SaveIndicator'
import FactoryIcon from '@mui/icons-material/Factory'
import CategoryIcon from '@mui/icons-material/Category'
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';

function ActionToolbar({
  onAddNode,
  onAddDemand,
  onSaveConfig,
  onLoadConfig,
  onViewNetworks,
  onSaveScenario,
  onCompareScenarios,
  onRunSimulation,
  onClearAll,
  simTime,
  onSimTimeChange,
  onNewNetwork,
  onRenameNetwork,
  onSaveAsNew,
  isSimulating,
  hasResults,
  stats,
  onMenuClick,
  themeMode,
  onThemeToggle,
  onValidate,
  user,
}) {
  const theme = useTheme()
  const [buildMenuAnchor, setBuildMenuAnchor] = React.useState(null)
  const [fileMenuAnchor, setFileMenuAnchor] = React.useState(null)
  const [analyzeMenuAnchor, setAnalyzeMenuAnchor] = React.useState(null)
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null)
  const [helpMenuAnchor, setHelpMenuAnchor] = React.useState(null)

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '1.3rem',
          letterSpacing: '-0.5px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mr: 2,
          transition: 'all 0.3s ease',
        }}
      >
        SupplyNet-Web
      </Typography>

      <Divider orientation="vertical" flexItem />

      {/* BUILD */}
      <Button
        variant="text"
        startIcon={<AddIcon />}
        onClick={e => setBuildMenuAnchor(e.currentTarget)}
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        Build
      </Button>
      {/* Build Menu */}
      <Menu
        anchorEl={buildMenuAnchor}
        open={Boolean(buildMenuAnchor)}
        onClose={() => setBuildMenuAnchor(null)}
        PaperProps={{
          elevation: 3,
          sx: { width: 240, mt: 0.5, borderRadius: 2 },
        }}
      >
        <MenuItem
          onClick={() => {
            onAddNode('supplier')
            setBuildMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <LocalShippingIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Add Supplier
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onAddNode('factory')
            setBuildMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <FactoryIcon fontSize="small" sx={{ color: '#f59e0b' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Add Factory
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onAddNode('distributor')
            setBuildMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <InventoryIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Add Distributor
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onAddNode('retailer')
            setBuildMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <StorefrontIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Add Retailer
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            onAddDemand()
            setBuildMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Add Customer Demand
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            onClearAll()
            setBuildMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <ClearIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: 'error.main' }}
          >
            Clear All
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* SIMULATE */}
      <Button
        variant="contained"
        startIcon={isSimulating ? null : <PlayArrowIcon />}
        onClick={onRunSimulation}
        disabled={isSimulating || stats.nodes === 0}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {isSimulating ? 'Running...' : 'Simulate'}
      </Button>

      {/* ANALYZE */}
      <Button
        variant="text"
        startIcon={<BarChartIcon />}
        onClick={e => setAnalyzeMenuAnchor(e.currentTarget)}
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        Analyze
      </Button>
      <Menu
        anchorEl={analyzeMenuAnchor}
        open={Boolean(analyzeMenuAnchor)}
        onClose={() => setAnalyzeMenuAnchor(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 0.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onSaveScenario()
            setAnalyzeMenuAnchor(null)
          }}
          disabled={!hasResults}
        >
          <ListItemIcon>
            <BookmarkIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Save Scenario
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onCompareScenarios()
            setAnalyzeMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <CompareArrowsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Compare Scenarios
            {stats.scenarios > 0 && (
              <Chip
                label={stats.scenarios}
                size="small"
                sx={{ ml: 1, height: 18, fontSize: '0.7rem' }}
              />
            )}
          </ListItemText>
        </MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem />

      {/* Validate Button */}
      <Button
        variant="outlined"
        startIcon={<CheckCircleIcon />}
        onClick={onValidate}
        sx={{
          color: 'text.primary',
          borderColor: 'divider',
          fontWeight: 600,
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main',
          },
        }}
      >
        Validate
      </Button>

      <Divider orientation="vertical" flexItem />

      {/* Sim Time */}
      <Tooltip title="Simulation Duration">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            transition: 'all 0.3s ease',
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
          <input
            type="number"
            value={simTime}
            onChange={e => onSimTimeChange(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="365"
            style={{
              width: '40px',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
              color: theme.palette.text.primary,
              backgroundColor: 'transparent',
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.7rem', ml: 0.3 }}
          >
            days
          </Typography>
        </Box>
      </Tooltip>

      {/* FILE */}
      <Button
        variant="text"
        startIcon={<SaveIcon />}
        onClick={e => setFileMenuAnchor(e.currentTarget)}
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        File
      </Button>
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={() => setFileMenuAnchor(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 0.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            minWidth: 240,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onNewNetwork()
            setFileMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            New Network
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onViewNetworks()
            setFileMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <FolderIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            My Networks
            {stats.savedNetworks > 0 && (
              <Chip
                label={stats.savedNetworks}
                size="small"
                sx={{ ml: 1, height: 18, fontSize: '0.7rem' }}
              />
            )}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onRenameNetwork()
            setFileMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Rename Network
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onSaveAsNew()
            setFileMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Save As New
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            onSaveConfig()
            setFileMenuAnchor(null)
          }}
          disabled={stats.nodes === 0}
        >
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Export JSON
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onLoadConfig()
            setFileMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <FileUploadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Import JSON
          </ListItemText>
        </MenuItem>
      </Menu>

      <Box sx={{ flexGrow: 1 }} />

      {/* Theme Toggle */}
      <ThemeToggle mode={themeMode} onToggle={onThemeToggle} />

      {/* Clear */}
      <Tooltip title="Clear Workspace">
        <IconButton
          onClick={onClearAll}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'error.light', color: 'error.main', opacity: 0.1 },
          }}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Help */}
      <IconButton
        onClick={e => setHelpMenuAnchor(e.currentTarget)}
        size="small"
        sx={{
          color: 'text.secondary',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={helpMenuAnchor}
        open={Boolean(helpMenuAnchor)}
        onClose={() => setHelpMenuAnchor(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 0.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setHelpMenuAnchor(null)
            onMenuClick('help')
          }}
        >
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Help & Docs
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setHelpMenuAnchor(null)
            onMenuClick('about')
          }}
        >
          <ListItemIcon>
            <InfoIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            About
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* User */}
      {/* User */}
      <IconButton
        onClick={e => setUserMenuAnchor(e.currentTarget)}
        sx={{
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 280,
            mt: 0.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {user?.email || 'No email'}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null)
            onMenuClick('settings')
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Settings
          </ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null)
            onMenuClick('logout')
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: 'error.main' }}
          >
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ActionToolbar
