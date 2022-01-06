import React, { Fragment, useState, useEffect } from "react";
import Select, { Props, components } from "react-select"; //https://github.com/JedWatson/react-select/blob/master/packages/react-select/src/Select.js
import { makeStyles, createStyles, Theme, useTheme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import { isArray } from "util";
import VirtualizedList from "./VirtualizedList";

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    overrideRootListItemIcon: {
      color: (props: any) => (props.isSelected ? "#fff !important" : theme.palette.secondary.light),
    },
  });
});
interface MyProps extends Props {
  label?: string;
  required?: boolean;
  helperText?: string;
  id?: string;
  InputLabelProps?: any;
  FormHelperTextProps?: any;
  onChangeEvent: (value: any) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onBlurEvent?: Function;
  error?: boolean;
  hideIndicatorSeparator?: boolean;
  hasIcons?: boolean;
  overrideStyleSingleValue?: any;
  overrideStyleOptions?: any;
  hideDropdownIndicator?: boolean;
  hideSingleValueLabel?: boolean;
  hideMenuPortalAccessBody?: boolean;
  //////virtualize props
  virtualize?: boolean; //active virtualization
  // vLoading?: boolean; // Show loading design for an extra outside reason
  VLoadingComponent?: React.ReactNode;
  vHasNextPage?: boolean; //Indicate if there is more data to load
  vIsNextPageLoading?: boolean; //Indicate if currently loading a data
  // eslint-disable-next-line @typescript-eslint/ban-types
  vLoadNextPage?: Function; // Callback function responsible for loading the next page of data.
  vTotalOfVisiblesRows?: number; //total of rows will be visible in the screen
  vWidthOfRows?: number; // width is going to have the rows
  // eslint-disable-next-line @typescript-eslint/ban-types
  onMenuCloseEvent?: Function;
}

const CustomSelect = ({
  helperText,
  id,
  label,
  required = false,
  InputLabelProps,
  FormHelperTextProps,
  onChangeEvent,
  onBlurEvent,
  error,
  hideIndicatorSeparator,
  hasIcons,
  overrideStyleSingleValue,
  overrideStyleOptions,
  hideDropdownIndicator,
  hideSingleValueLabel,
  hideMenuPortalAccessBody,
  ///////////
  virtualize,
  // vLoading,
  VLoadingComponent,
  vHasNextPage,
  vIsNextPageLoading,
  vLoadNextPage,
  vTotalOfVisiblesRows,
  vWidthOfRows,
  onMenuCloseEvent,
  //////////
  ...restPropsSelect
}: MyProps) => {
  const projectTheme = useTheme();
  ///////////////// STYLE ///////////////////////////////
  const colourStyles = {
    menu: (provided: any, state: any) => {
      return {
        ...provided,
        position: "relative",
      };
    },
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),

    control: (provided: any, state: any) => {
      return {
        ...provided,
        // zIndex:
      };
    },
    multiValueLabel: (base: any) => ({
      ...base,
      backgroundColor: projectTheme.palette.primary.light,
      color: "black",
      borderRadius: 5,
    }),
    // singleValue: (base: any) => ({
    //   ...base,
    //   padding: 2,
    //   borderRadius: 5,
    //   background: palette.primary.light,
    //   color: 'black',
    //   // display: 'flex',
    // }),
    indicatorSeparator: (styles: any) => (hideIndicatorSeparator ? { display: "none" } : styles),
    dropdownIndicator: (styles: any) => (hideDropdownIndicator ? { display: "none" } : styles),
  };
  //////////////////////////////////////////////////////////////////////////
  /////////////////// Label Control ///////////////////////////////////////
  const helperTextId = helperText && id ? `${id}-helper-text` : undefined;
  const inputLabelId = label && id ? `${id}-label` : undefined;
  const [showLabelInTop, setShowLabelInTop] = useState(false);
  const [activeColorText, setActiveColorText] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const onBlurHandle = (event: any) => {
    if (quantity > 0) {
      setShowLabelInTop(true);
      setActiveColorText(false);
    } else {
      setShowLabelInTop(false);
    }
    onBlurEvent && onBlurEvent(event);
  };
  const onFocusHandle = () => {
    setShowLabelInTop(true);
    setActiveColorText(true);
  };
  enum OnChangeActionType {
    "select-option", //Selecting an option from the list
    "deselect-option", // (Multiple) Deselecting an option from the list
    "remove-value", //(Multiple) Removing a selected option with the remove button
    "pop-value", // Removing options using backspace
    "set-value", //Calling setValue from a component without an action
    "clear", //Removing all selected options with the clear button
    "create-option", //(Creatable) Creating a new option
  }
  const onChangeHandle = (newValue: any, actionMeta: OnChangeActionType) => {
    onChangeEvent(newValue);
    if (isArray(newValue)) {
      if (newValue == null || newValue.length == 0) {
        setQuantity(0);
      } else {
        setQuantity(newValue.length);
      }
    } else {
      if (newValue == null) {
        setQuantity(0);
      } else {
        setQuantity(1);
      }
    }
  };
  enum InputChangeActionType {
    "set-value",
    "input-change",
    "input-blur",
    "menu-close",
  }
  const onInputChange = (action: InputChangeActionType) => {
    //
  };
  const onMenuClose = () => {
    if (virtualize) {
      setFilterValue("");
      setPageCount(1);
      onMenuCloseEvent && onMenuCloseEvent();
      // handleLoadNextPage(0,0,1,"",true)
    }
  };
  useEffect(() => {
    setActiveColorText(false);

    if (isArray(restPropsSelect.value)) {
      setQuantity(restPropsSelect.value.length);
      if (restPropsSelect.value.length) {
        setShowLabelInTop(true);
      } else {
        setShowLabelInTop(false);
      }
    } else {
      if (restPropsSelect.value) {
        setShowLabelInTop(true);
        setQuantity(1);
      } else {
        setShowLabelInTop(false);
        setQuantity(0);
      }
    }
  }, [restPropsSelect.value]);
  //////////////////////////////////////////////////////////////////////////
  const [pageCount, setPageCount] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const onVirtualizeInputChange = (inputValue: any, actionMeta: any) => {
    console.log("onVirtualizeInputChange");
    if (actionMeta.action === "input-change") {
      // vCleanData && vCleanData();
      handleLoadNextPage(0, 0, 1, inputValue, true);
    }
    // if (actionMeta.action === "menu-close") {
    //   setFilterValue("");
    //   setPageCount(1);
    //   vCleanData && vCleanData();
    //   // handleLoadNextPage(0,0,1,"",true)
    // }
  };
  const handleLoadNextPage = (
    startIndex: number,
    stopIndex: number,
    page?: number,
    filterText?: string,
    isInputChange?: boolean
  ) => {
    try {
      vLoadNextPage &&
        vLoadNextPage(
          startIndex,
          stopIndex,
          page ? page : pageCount,
          isInputChange ? filterText : filterValue
        );
      if (page) {
        setPageCount(page + 1);
      } else {
        setPageCount(pageCount + 1);
      }
      if (isInputChange) {
        setFilterValue(filterText || "");
      }
    } catch (e) {
      //
    }
  };
  //////////////////////////////////////////////////////////////////////////
  const { Option, SingleValue, GroupHeading, Group, MenuList } = components;
  const CustomSelectOption = (props: any) => {
    const classes = useStyles(props);
    return (
      <Option {...props}>
        <div style={overrideStyleOptions ?? { display: "flex", alignItems: "center" }}>
          {/* {hasIcons ? <img style={{ objectFit: "contain", width: "24px", height: "20px", marginRight: "5px" }} src={props.data.icon} alt="" /> : null} */}
          {hasIcons ? (
            <props.data.icon
              style={{ marginRight: "5px" }}
              fontSize={"small"}
              classes={{
                root: classes.overrideRootListItemIcon,
              }}
            />
          ) : null}
          {props.children ?? null}
        </div>
      </Option>
    );
  };
  const CustomSelectValue = (props: any) => {
    let TheIcon: any = null;
    if (hasIcons) {
      TheIcon = props.options.find((option: any) => option.value === props.data.value).icon;
    }
    return (
      <SingleValue {...props}>
        <div style={overrideStyleSingleValue ?? { display: "flex", alignItems: "center" }}>
          {/* {hasIcons ? <img style={{ objectFit: "contain", width: "24px", height: "20px", marginRight: "5px", color: "blue" }} src={props.options.find((option: any) => option.value === props.data.value).icon} alt="" /> : null} */}

          {hasIcons ? <TheIcon style={{ marginRight: "5px" }} fontSize={"small"} /> : null}
          {hideSingleValueLabel ? null : props.children ?? null}
          {/* {props.data.label} */}
        </div>
      </SingleValue>
    );
  };

  const CustomGroupHeading = (props: any) => {
    return <GroupHeading {...props} />;
  };

  const CustomGroup = (props: any) => {
    return <Group {...props} />;
  };

  const CustomMenuList = (props: any) => {
    return <MenuList {...props} />;
  };
  /////////////////////////////////////////////////////////////////////////
  return (
    <Fragment>
      {label && showLabelInTop ? (
        <InputLabel
          htmlFor={id}
          id={inputLabelId}
          {...InputLabelProps}
          color={"primary"}
          focused={activeColorText}
          error={error}
          required={required}
          variant={"outlined"}
          shrink
          style={{
            // transform: "translate(8px, -6px) scale(0.75)",
            // zIndex: 2,
            backgroundColor: projectTheme.palette.background.paper,
            position: "absolute",
            paddingLeft: "5px",
            paddingRight: "5px",
            marginLeft: "-4px",
            // color: palette.primary.main
          }}
        >
          {label}
        </InputLabel>
      ) : null}
      <Select
        {...restPropsSelect}
        onBlur={(event: any) => onBlurHandle(event)}
        onFocus={onFocusHandle}
        onChange={(value: any, meta: any) => onChangeHandle(value, meta)}
        onInputChange={virtualize ? onVirtualizeInputChange : (meta: any) => onInputChange(meta)}
        onMenuClose={onMenuClose}
        menuPortalTarget={hideMenuPortalAccessBody ? null : document.body}
        placeholder={
          !showLabelInTop ? (
            <InputLabel
              htmlFor={id}
              id={inputLabelId}
              {...InputLabelProps}
              color={"primary"}
              focused={false}
              error={error}
              required={required}
              // variant={"outlined"}
              // shrink
              style={{
                paddingLeft: "4px",
              }}
            >
              {label}
            </InputLabel>
          ) : (
            ""
          )
        }
        styles={colourStyles}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: projectTheme.palette.primary.light,
            primary: error ? projectTheme.palette.error.main : projectTheme.palette.primary.main,
            // primary75: 'green',//'#4C9AFF',
            primary50: projectTheme.palette.primary.dark, //'#B2D4FF', //this color appear clicked press for more than 1 second
            danger: projectTheme.palette.error.dark,
            dangerLight: projectTheme.palette.error.light,

            neutral0: projectTheme.palette.background.paper, //'hsl(0, 0%, 100%)',
            neutral5: projectTheme.palette.action.disabledBackground, //'hsl(0, 0%, 95%)', // disabled color
            neutral10: projectTheme.palette.primary.light, //'hsl(0, 0%, 90%)',
            neutral20: error ? projectTheme.palette.error.main : projectTheme.palette.text.hint, //'hsl(0, 0%, 80%)' //this is for the border
            neutral30: error ? projectTheme.palette.error.main : projectTheme.palette.text.primary, //'hsl(0, 0%, 70%)' //this is the border hover
            neutral40: "hsl(0, 0%, 60%)",
            neutral50: "hsl(0, 0%, 50%)",
            neutral60: "hsl(0, 0%, 40%)",
            neutral70: "hsl(0, 0%, 30%)",
            neutral80: projectTheme.palette.text.primary, //'hsl(0, 0%, 20%)', //this is for the text during the input
            neutral90: "hsl(0, 0%, 10%)",
          },
          spacing: {
            ...theme.spacing,
            controlHeight: 40, // 1.1876em to px = 19 => 1.187 is the textfield defualt height
          },
        })}
        components={{
          Option: CustomSelectOption,
          SingleValue: CustomSelectValue,
          Group: CustomGroup,
          GroupHeading: CustomGroupHeading,
          MenuList: virtualize ? VirtualizeMenuList : CustomMenuList,
        }}
        hasNextPage={vHasNextPage as any}
        isNextPageLoading={vIsNextPageLoading}
        LoadingComponent={VLoadingComponent}
        filterOption={virtualize ? undefined : () => true}
        itemSize={() => vWidthOfRows || 45}
        totalOfVisiblesRows={vTotalOfVisiblesRows}
        loadNextPage={(startIndex: number, stopIndex: number) =>
          handleLoadNextPage(startIndex, stopIndex, undefined, filterValue, false)
        }
      />
      {helperText && (
        <FormHelperText
          id={helperTextId}
          error={error}
          {...FormHelperTextProps}
          style={{
            //this is the style that got helperText in the textfield when is variant = outlined and size = small
            marginLeft: "14px",
            marginRight: "14px",
            marginTop: "4px",
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Fragment>
  );
};
export default CustomSelect;

const VirtualizeMenuList = (props: any) => {
  const listRef = React.useRef(null);
  const children = Array.isArray(props.children) ? props.children : [props.children];
  const heightCalc = children.length * props.selectProps.itemSize();
  const customHeight = props.selectProps.totalOfVisiblesRows
    ? props.selectProps.itemSize() * props.selectProps.totalOfVisiblesRows
    : heightCalc >= 300
    ? 300
    : heightCalc;
  // const currentIndex = Math.max(
  //   children.findIndex(child => child.props.isFocused),
  //   0
  // );
  let countShowLoading = 0;
  return (
    <VirtualizedList
      listRef={(ref:any) => {
        listRef.current = ref;
      }}
      width={100}
      height={customHeight}
      listStyle={{ width: "100%" }}
      items={children}
      hasNextPage={props.selectProps.hasNextPage}
      isNextPageLoading={props.selectProps.isNextPageLoading}
      loadNextPage={props.selectProps.loadNextPage}
      itemSize={props.selectProps.itemSize}
    >
      {({ index, style }: any) => {
        if (props.selectProps.isNextPageLoading) {
          countShowLoading++;
        }
        const loadingStyle = { ...style, marginTop: "20px" };
        return (
          //  children[index]
          !props.selectProps.isNextPageLoading ? (
            <div style={style}>{children[index]}</div>
          ) : countShowLoading > 1 ? null : (
            <div style={loadingStyle}>{<props.selectProps.LoadingComponent />}</div>
          )
        );
      }}
    </VirtualizedList>
  );
};
//NOTES:
// getOptionLabel={option => `${option.label}: ${option.value}`}
