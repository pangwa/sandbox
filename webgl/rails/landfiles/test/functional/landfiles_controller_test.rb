require 'test_helper'

class LandfilesControllerTest < ActionController::TestCase
  setup do
    @landfile = landfiles(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:landfiles)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create landfile" do
    assert_difference('Landfile.count') do
      post :create, :landfile => @landfile.attributes
    end

    assert_redirected_to landfile_path(assigns(:landfile))
  end

  test "should show landfile" do
    get :show, :id => @landfile.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @landfile.to_param
    assert_response :success
  end

  test "should update landfile" do
    put :update, :id => @landfile.to_param, :landfile => @landfile.attributes
    assert_redirected_to landfile_path(assigns(:landfile))
  end

  test "should destroy landfile" do
    assert_difference('Landfile.count', -1) do
      delete :destroy, :id => @landfile.to_param
    end

    assert_redirected_to landfiles_path
  end
end
