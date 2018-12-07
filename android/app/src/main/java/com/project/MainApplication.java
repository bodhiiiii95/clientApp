package com.project;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.localz.PinchPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.pilloxa.backgroundjob.BackgroundJobPackage;
import com.arttitude360.reactnative.rngoogleplaces.RNGooglePlacesPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.reactlibrary.securekeystore.RNSecureKeyStorePackage;
import com.oblador.keychain.KeychainPackage;
import com.sha256lib.Sha256Package;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oblador.vectoricons.VectorIconsPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new PinchPackage(),
            new BackgroundTimerPackage(),
            new VectorIconsPackage(),
            new BackgroundJobPackage(),
            new RNGooglePlacesPackage(),
            new MapsPackage(),
            new RNSecureKeyStorePackage(),
            new KeychainPackage(),
            new Sha256Package()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
