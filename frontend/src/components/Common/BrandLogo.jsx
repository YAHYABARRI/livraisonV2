import logoBlueBg from '../../assets/logo-blue-bg.png';
import logoDark from '../../assets/logo-dark.png';
import logoLight from '../../assets/logo-light.png';

const VARIANTS = {
  dark: logoDark,
  light: logoLight,
  blue: logoBlueBg,
};

const baseClassName = 'block h-auto max-h-10 w-auto max-w-[120px] object-contain md:max-h-12 md:max-w-[160px]';

const BrandLogo = ({ variant = 'auto', className = '' }) => {
  if (variant === 'auto') {
    return (
      <>
        <img
          src={logoDark}
          alt="GLADEX DELIVERY logo"
          className={`${baseClassName} dark:hidden ${className}`}
          width="160"
          height="64"
        />
        <img
          src={logoLight}
          alt="GLADEX DELIVERY logo"
          className={`${baseClassName} hidden dark:block ${className}`}
          width="160"
          height="64"
        />
      </>
    );
  }

  return (
    <img
      src={VARIANTS[variant] || logoDark}
      alt="GLADEX DELIVERY logo"
      className={`${baseClassName} ${className}`}
      width="160"
      height="64"
    />
  );
};

export default BrandLogo;
