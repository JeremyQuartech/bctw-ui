import { Banner, BannerProps } from 'components/alerts/Banner';
import { Icon } from 'components/common';
import { useEffect, useState } from 'react';
import WarningPrompts, { WarningPromptsProps } from './WarningPrompts';

type WarningPromptsBannerProps = WarningPromptsProps &
  Pick<BannerProps, 'text'> & {
    allClearText: string;
  };

export default function WarningPromptsBanner(props: WarningPromptsBannerProps): JSX.Element {
  const { allClearText, text, prompts, onAllChecked, onNotAllChecked, handledWarning } = props;
  const [allClear, setAllClear] = useState(false);

  const handleAllChecked = () => {
    setAllClear(true);
    onAllChecked();
  };

  const handleNotAllChecked = () => {
    setAllClear(false);
    onNotAllChecked();
  };

  useEffect(() => {
    if (prompts.length == 0) {
      handleAllChecked();
    }
  }, [prompts]);

  return (
    <Banner
      variant={allClear ? 'success' : 'warning'}
      text={allClear ? allClearText : text}
      action={prompts.length > 0 ? 'collapse' : null}
      hiddenContent={[
        <WarningPrompts
          prompts={prompts}
          onAllChecked={handleAllChecked}
          onNotAllChecked={handleNotAllChecked}
          handledWarning={handledWarning}
        />
      ]}
    />
  );
}
