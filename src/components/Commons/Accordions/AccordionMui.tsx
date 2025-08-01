import React, { useEffect } from 'react';
import { AccordionActions, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps, accordionSummaryClasses } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import { AccordionMuiComponent } from '../models/component.model';
import { combineClasses } from '../../../utils/extension';
import ButtonMui from '../Buttons/ButtonMui';
import CloseIcon from '@mui/icons-material/Close';

interface IAccordionSummaryProps extends AccordionSummaryProps {
  hideIcon?: boolean;
}

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  ({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&::before': {
      display: 'none',
    },
  })
);

const AccordionSummary = styled((props: IAccordionSummaryProps) => {
  const { hideIcon, ...otherProps } = props;
  return (
    <MuiAccordionSummary expandIcon={!hideIcon && <ExpandMoreIcon color="primary" />} {...otherProps} />
  );
})(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const AccordionMui = <T,>(props: AccordionMuiComponent<T>) => {
  const [expanded, setExpanded] = React.useState<T>();

  useEffect(() => {
    setExpanded(props.defaultValue);
  }, [props.defaultValue]);

  const handleChange = (panel: T | undefined, index: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    const result = isExpanded ? panel : undefined;
    setExpanded(result);
    props.onChange?.(result, index);
  };

  return (
    <Box className={combineClasses('w-100', props.className)}>
      {props.items?.map((item, index) => (
        <Accordion
          key={index}
          expanded={(expanded && props.alwaysOpen === 'always') || expanded === item.value}
          onChange={handleChange(item.value, index)}
          sx={{ p: 0, ...(item.sxHeader ? item.sxHeader : {}) }}
        >
          <AccordionSummary sx={item.sxSummary} aria-controls={`panel-bh-content-${index}`} id={`panel-bh-header-${index}`} hideIcon={item.hideIcon}>
            {item.label}
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'background.default', ...(item.noPadding ? { p: 0 } : {}), ...(item.sxDetails ? item.sxDetails : {}) }}>
            {item.children}
          </AccordionDetails>
          {(item.footer || props.isShowAction) && (
            <AccordionActions sx={item.sxFooter}>
              {item.footer ? (
                item.footer
              ) : props.isShowAction ? (
                <ButtonMui variant="outlined" label="Close" endIcon={<CloseIcon color="error" />} onClick={() => setExpanded(undefined)} />
              ) : null}
            </AccordionActions>
          )}
        </Accordion>
      ))}
    </Box>
  );
};

export default AccordionMui;
