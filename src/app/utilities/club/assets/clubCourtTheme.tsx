'use client';

import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonBase,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaletteIcon from '@mui/icons-material/Palette';
import { CompactPicker } from 'react-color';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import type { ClubInterface } from '@/types/club/types';
import {
  FibaCourt,
  courtViewBox,
  COURT_PATTERNS,
  type CourtPattern,
  type CourtTheme,
  isCourtPattern,
} from '@/app/components/drillEditor/FibaCourt';

interface Props {
  selectedClub: ClubInterface;
  onEditChange: (field: keyof ClubInterface, value: ClubInterface[keyof ClubInterface]) => void;
  expanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

/* Default values used when a field is empty. Kept here in addition to the
 * defaults inside FibaCourt so the live preview reflects the same colours
 * the user sees when leaving them blank. */
const DEFAULT_LINE = '#ffffff';
const DEFAULT_MARGIN = '#e7ecef';

/**
 * Unified "Club colours & appearance" section that combines:
 *   - Brand colours (background / foreground)
 *   - Court appearance (pattern, line/margin/key/centre colours, logo toggle)
 * All changes flow through the parent `onEditChange` callback so they are
 * persisted by the parent's main Save button together with the rest of the
 * club fields.
 */
const ClubCourtTheme: React.FC<Props> = ({
  selectedClub,
  onEditChange,
  expanded,
  onExpandedChange,
}) => {
  const { t } = useTranslation();

  const background = selectedClub.courtBackground ?? '';
  const keyFill = selectedClub.courtKeyColor ?? '';
  const centerFill = selectedClub.courtCenterColor ?? '';
  const lineColor = selectedClub.courtLineColor ?? '';
  const marginColor = selectedClub.courtMarginColor ?? '';
  const showLogo = selectedClub.courtShowLogo ?? true;
  const logoRotation = selectedClub.courtLogoRotation ?? 90;
  const brandBg = selectedClub.backgroundColor ?? '';
  const brandFg = selectedClub.foregroundColor ?? '';

  const theme: CourtTheme = useMemo(
    () => ({
      background: background || null,
      keyFill: keyFill || null,
      centerFill: centerFill || null,
      lineColor: lineColor || null,
      marginColor: marginColor || null,
      centerLogoUrl: showLogo ? selectedClub.image || null : null,
      centerLogoRotation: logoRotation,
    }),
    [
      background,
      keyFill,
      centerFill,
      lineColor,
      marginColor,
      showLogo,
      logoRotation,
      selectedClub.image,
    ]
  );

  return (
    <Accordion expanded={expanded} onChange={(_e, v) => onExpandedChange?.(v)} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flex: 1 }}>
          <PaletteIcon />
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {t('club.appearance.title')}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mr: 1 }}>
            {brandBg && <SwatchDot color={brandBg} />}
            {brandFg && <SwatchDot color={brandFg} />}
            {background && !isCourtPattern(background) && <SwatchDot color={background} />}
            {keyFill && <SwatchDot color={keyFill} />}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              {/* Brand colours (merged from the old "Cores" accordion) */}
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {t('club.appearance.brandSection')}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <ColorPickerField
                    label={t('club.backgroundColor')}
                    value={brandBg}
                    onChange={(v) => onEditChange('backgroundColor', v)}
                    fallback="#ffffff"
                  />
                  <ColorPickerField
                    label={t('club.foregroundColor')}
                    value={brandFg}
                    onChange={(v) => onEditChange('foregroundColor', v)}
                    fallback="#000000"
                  />
                </Grid>
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: brandBg || '#ffffff',
                    color: brandFg || '#000000',
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: 'inherit', fontWeight: 700 }}>
                    {selectedClub.name || t('club.singular')}
                  </Typography>
                </Box>
              </Box>

              {/* Court appearance */}
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {t('club.appearance.courtSection')}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  {t('club.courtTheme.backgroundHint')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {(['', ...COURT_PATTERNS] as Array<'' | CourtPattern>).map((p) => (
                    <PatternSwatch
                      key={p || 'default'}
                      pattern={p}
                      selected={background === p || (p === '' && !background)}
                      label={
                        p ? t(`club.courtTheme.patterns.${p}`) : t('club.courtTheme.patternDefault')
                      }
                      onSelect={() => onEditChange('courtBackground', p)}
                    />
                  ))}
                </Stack>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <ColorPickerField
                    label={t('club.courtTheme.backgroundColor')}
                    helper={t('club.courtTheme.backgroundColorHint')}
                    value={isCourtPattern(background) ? '' : background}
                    onChange={(v) => onEditChange('courtBackground', v)}
                    fallback="#d5a066"
                  />
                  <ColorPickerField
                    label={t('club.courtTheme.lineColor')}
                    value={lineColor}
                    onChange={(v) => onEditChange('courtLineColor', v)}
                    fallback={DEFAULT_LINE}
                  />
                  <ColorPickerField
                    label={t('club.courtTheme.marginColor')}
                    value={marginColor}
                    onChange={(v) => onEditChange('courtMarginColor', v)}
                    fallback={DEFAULT_MARGIN}
                  />
                  <ColorPickerField
                    label={t('club.courtTheme.keyFill')}
                    value={keyFill}
                    onChange={(v) => onEditChange('courtKeyColor', v)}
                    fallback="#0089cf"
                    allowEmpty
                  />
                  <ColorPickerField
                    label={t('club.courtTheme.centerFill')}
                    value={centerFill}
                    onChange={(v) => onEditChange('courtCenterColor', v)}
                    fallback="#0089cf"
                    allowEmpty
                  />
                </Grid>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showLogo}
                        onChange={(e) => onEditChange('courtShowLogo', e.target.checked)}
                      />
                    }
                    label={t('club.courtTheme.showLogo')}
                  />
                  {showLogo && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t('club.courtTheme.logoRotation')}
                      </Typography>
                      <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={logoRotation}
                        onChange={(_e, v) => v !== null && onEditChange('courtLogoRotation', v)}
                      >
                        {[0, 90, 180, 270].map((deg) => (
                          <ToggleButton key={deg} value={deg} sx={{ px: 1.25 }}>
                            {deg}°
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Live preview — full court so the centre logo is visible. */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1500 / 2800',
                maxHeight: 600,
                mx: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: '#eceff1',
              }}
            >
              <svg
                viewBox={courtViewBox(true)}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                <FibaCourt full theme={theme} />
              </svg>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

function SwatchDot({ color }: { color: string }) {
  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: 0.5,
        backgroundColor: color,
        border: '1px solid',
        borderColor: 'divider',
      }}
    />
  );
}

function PatternSwatch({
  pattern,
  selected,
  label,
  onSelect,
}: {
  pattern: '' | CourtPattern;
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  /* Mini half-court sample so the user can see how the floor will look. */
  const theme: CourtTheme = { background: pattern || null };
  return (
    <ButtonBase
      onClick={onSelect}
      sx={{
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 1,
        p: 0.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: selected ? 'action.selected' : 'transparent',
        width: 86,
      }}
    >
      <Box sx={{ width: 72, aspectRatio: '1500 / 1400', overflow: 'hidden' }}>
        <svg
          viewBox={courtViewBox(false)}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <FibaCourt full={false} theme={theme} />
        </svg>
      </Box>
      <Typography variant="caption" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

/* Compact colour picker (react-color) with a swatch preview, matching the
 * pattern used in the rest of the club settings page. */
function ColorPickerField({
  label,
  value,
  onChange,
  fallback,
  helper,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fallback: string;
  helper?: string;
  allowEmpty?: boolean;
}) {
  const display = value || fallback;
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            backgroundColor: display,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        />
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <CompactPicker color={display} onChangeComplete={(c) => onChange(c.hex)} />
          {(helper || (allowEmpty && value)) && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {helper && (
                <Typography variant="caption" color="text.secondary">
                  {helper}
                </Typography>
              )}
              {allowEmpty && value && (
                <Button size="small" onClick={() => onChange('')}>
                  {label.charAt(0) === '' ? '' : '×'}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Grid>
  );
}

export default ClubCourtTheme;
