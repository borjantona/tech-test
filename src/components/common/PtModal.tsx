import { Box, Modal, Typography } from "@mui/material";

export interface ModalProps {
  label: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
export default function PtModal(props: ModalProps) {
  const { label, open, onClose, children } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          transform: "translate(-50%, -20%)",
          background: "#FFF",
        }}
        position="absolute"
        top="20%"
        left="50%"
        border="2px solid #FFF"
        boxShadow="24"
        padding="16px"
        width="400px"
        borderRadius={2}
      >
        <Typography
          marginBottom={2}
          id="modal-modal-title"
          variant="h6"
          component="h2"
          color="#000"
        >
          {label}
        </Typography>
        {children}
      </Box>
    </Modal>
  );
}
