class LandfilesController < ApplicationController
  # GET /landfiles
  # GET /landfiles.json
  respond_to :html, :xml
  respond_to :js, :only => [:create, :update, :destroy]
  def index
    @landfiles = Landfile.all

  #  respond_to do |format|
  #    format.html # index.html.erb
  #    format.json { render :json => @landfiles }
  #  end
  end

  # GET /landfiles/1
  # GET /landfiles/1.json
  def show
    @landfile = Landfile.find(params[:id])

    #respond_to do |format|
    #  format.html # show.html.erb
    #  format.json { render :json => @landfile }
    #end
  end

  # GET /landfiles/new
  # GET /landfiles/new.json
  def new
    @landfile = Landfile.new

    respond_with do |format|
      format.html { render :layout => ! request.xhr? }
    end
    #respond_to do |format|
    #  format.html # new.html.erb
    #  format.json { render :json => @landfile }
    #end
  end

  # GET /landfiles/1/edit
  def edit
    @landfile = Landfile.find(params[:id])
  end

  # POST /landfiles
  # POST /landfiles.json
  def create
    @landfile = Landfile.new(params[:landfile])
    redirect_to landfiles_path unless request.xhr?

  #  respond_to do |format|
  #    if @landfile.save
  #      format.html { redirect_to @landfile, :notice => 'Landfile was successfully created.' }
  #      format.json { render :json => @landfile, :status => :created, :location => @landfile }
  #    else
  #      format.html { render :action => "new" }
  #      format.json { render :json => @landfile.errors, :status => :unprocessable_entity }
  #    end
  #  end
  end

  # PUT /landfiles/1
  # PUT /landfiles/1.json
  def update
    @landfile = Landfile.find(params[:id])

    respond_with do |format|
      format.html{ redirect_to @landfile }
    end
   # respond_to do |format|
   #   if @landfile.update_attributes(params[:landfile])
   #     format.html { redirect_to @landfile, :notice => 'Landfile was successfully updated.' }
   #     format.json { head :ok }
   #   else
   #     format.html { render :action => "edit" }
   #     format.json { render :json => @landfile.errors, :status => :unprocessable_entity }
   #   end
   # end
  end

  # DELETE /landfiles/1
  # DELETE /landfiles/1.json
  def destroy
    @landfile = Landfile.destroy(params[:id])
    #@landfile = Landfile.find(params[:id])
    #@landfile.destroy

    #respond_to do |format|
    #  format.html { redirect_to landfiles_url }
    #  format.json { head :ok }
    #end
  end
end
