import React, { useEffect, useRef, useState } from 'react';
import { AccordionActions, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps, accordionSummaryClasses } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import { AccordionMuiComponent } from '../models/component.model';
import { combineClasses, isIncludeList, isNotEmpty, toNumber } from '../../../utils/extension';
import ButtonMui from '../Buttons/ButtonMui';
import CloseIcon from '@mui/icons-material/Close';

interface IAccordionSummaryProps extends AccordionSummaryProps {
  hideIcon?: boolean;
}

const AccordionComponent = React.forwardRef<HTMLDivElement, AccordionProps>((props, ref) => (
  <MuiAccordion disableGutters elevation={0} square {...props} ref={ref} />
));

AccordionComponent.displayName = 'AccordionComponent';

const Accordion = styled(AccordionComponent)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: IAccordionSummaryProps) => {
  const { hideIcon, ...otherProps } = props;
  return <MuiAccordionSummary expandIcon={!hideIcon && <ExpandMoreIcon color="primary" />} {...otherProps} />;
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
  const [expanded, setExpanded] = useState<T>();
  const [multiExpanded, setMultiExpanded] = useState<T[]>([]);
  const [storeAccordions, setStoreAccordions] = useState<boolean[]>([]);
  const [isHiding, setIsHiding] = useState<boolean>(false);
  const accordionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (props.alwaysOpen) {
      setMultiExpanded(props.defaultValue ? [props.defaultValue] : []);
    } else {
      setExpanded(props.defaultValue);
    }
  }, [props.defaultValue, props.alwaysOpen]);

  useEffect(() => {
    if (isNotEmpty(storeAccordions)) {
      setStoreAccordions((prev) => {
        const itemsLength = props.items?.length || 0;
        if (itemsLength > prev.length) {
          return [...prev, ...Array(itemsLength - prev.length).fill(false)];
        } else if (itemsLength < prev.length) {
          return prev.slice(0, itemsLength);
        }
        return prev;
      });
    } else {
      setStoreAccordions(Array(props.items?.length || 0).fill(false));
    }
  }, [props.items]);

  const closeItem = (panel: T | undefined, index: number) => {
    if (props.alwaysOpen && panel) {
      if (isIncludeList(multiExpanded, panel)) {
        const updatedExpanded = multiExpanded.filter((item) => item !== panel);
        setMultiExpanded(updatedExpanded);
        props.onChange?.(updatedExpanded, index);
      } else {
        const updatedExpanded = [...multiExpanded, panel];
        setMultiExpanded(updatedExpanded);
        props.onChange?.(updatedExpanded, index);
      }
    }
  };

  const hidingAccordion = (index: number) => {
    const accordionRef = accordionsRef.current[index];
    const ref = accordionRef?.querySelector('.MuiCollapse-root') as HTMLDivElement;
    const refSummary = accordionRef?.querySelector('.MuiAccordionSummary-root') as HTMLDivElement;
    if (ref && refSummary) {
      const transitionDuration = toNumber(ref.style.transitionDuration?.replace('ms', '')) + refSummary.offsetHeight;
      setIsHiding(true);
      setTimeout(() => {
        setStoreAccordions((prevState) => {
          const newState = [...prevState];
          newState[index] = false;
          return newState;
        });
        setIsHiding(false);
      }, transitionDuration);
    }
  };

  const setHideAccordion = (index: number) => {
    if (!storeAccordions[index]) {
      if (!props.alwaysOpen) {
        const indexOpen = storeAccordions.findIndex((item, i) => item && i !== index);
        if (indexOpen > -1) {
          hidingAccordion(indexOpen);
        }
      }
      setStoreAccordions((prevState) => {
        const newState = [...prevState];
        newState[index] = true;
        return newState;
      });
    } else {
      hidingAccordion(index);
    }
  };

  const handleChange = (panel: T | undefined, index: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setHideAccordion(index);
    if (props.alwaysOpen) {
      closeItem(panel, index);
    } else {
      const result = isExpanded ? panel : undefined;
      setExpanded(result);
      props.onChange?.(result, index);
    }
  };

  const handleClose = (panel: T | undefined, index: number) => {
    setHideAccordion(index);
    if (props.alwaysOpen) {
      closeItem(panel, index);
    } else {
      setExpanded(undefined);
    }
  };

  return (
    <Box className={combineClasses('w-100', props.className)}>
      {props.items?.map((item, index) => (
        <Accordion
          key={index}
          ref={(el) => (accordionsRef.current[index] = el)}
          expanded={(props.alwaysOpen && isIncludeList(multiExpanded, item.value)) || expanded === item.value}
          onChange={!isHiding ? handleChange(item.value, index) : undefined}
          sx={{ p: 0, ...(item.sxHeader ? item.sxHeader : {}) }}
        >
          <AccordionSummary
            sx={item.sxSummary}
            aria-controls={`panel-bh-content-${index}`}
            id={`panel-bh-header-${index}`}
            hideIcon={item.hideIcon}
          >
            {item.label}
          </AccordionSummary>
          {storeAccordions[index] && (
            <>
              <AccordionDetails
                sx={{
                  bgcolor: 'background.default',
                  ...(item.noPadding ? { p: 0 } : {}),
                  ...(item.sxDetails ? item.sxDetails : {}),
                }}
              >
                {item.children}
              </AccordionDetails>
              {(item.footer || props.isShowAction) && (
                <AccordionActions sx={{ backgroundColor: 'background.paper', ...(item.sxFooter ? item.sxFooter : {}) }}>
                  {item.footer ? (
                    item.footer
                  ) : props.isShowAction ? (
                    <ButtonMui
                      variant="outlined"
                      label="Close"
                      endIcon={<CloseIcon color="error" />}
                      onClick={() => (!isHiding ? handleClose(item.value, index) : undefined)}
                    />
                  ) : null}
                </AccordionActions>
              )}
            </>
          )}
        </Accordion>
      ))}
    </Box>
  );
};

export default AccordionMui;
