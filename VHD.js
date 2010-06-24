//-----------------------------------------------------------------------
// <copyright>
//     Copyright (c) 2010 Garrett Serack. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------

var VHD = {
    VirtualizationService : GetObject("winmgmts:\\\\.\\root\\virtualization"),
    VHDService: GetObject("winmgmts:\\\\.\\root\\virtualization").ExecQuery("SELECT * FROM Msvm_ImageManagementService").ItemIndex(0),
    
    Mount : function(path) {
        path = Assert.File(FormatArguments(arguments));
        
        this.VHDService.Mount(path)
    },
    
    UnMount : function(path) {
        path = Assert.File(FormatArguments(arguments));
        
        this.VHDService.UnMount(path)
    },
    
    Compact : function(path ) {
        path = Assert.File(FormatArguments(arguments));
    
        var method = this.VHDService.Methods_.Item("CompactVirtualHardDisk");
        var inParams = method.InParameters.SpawnInstance_();
        inParams.Path = path;
        
        var outParams = this.VHDService.ExecMethod_(method.Name, inParams, null);
        
        if( outParams.ReturnValue  > 4096 ) {
            Print("Compact Disk Failed: result: {0}", outParams.ReturnValue );
            return false;
        }
            
        if( outParams.ReturnValue == 4096 )
            VHD.WaitForJob(outParams.Job.split('=')[1]);  
       
        return true;
    },
    
    Fork : function(originalPath, destinationPath) {
        originalPath = Assert.File(FormatArguments(originalPath, arguments));
        destinationPath =  $$.fso.GetAbsolutePathName(FormatArguments(destinationPath, arguments));
    
        var method = this.VHDService.Methods_.Item("CreateDifferencingVirtualHardDisk");
        var inParams = method.InParameters.SpawnInstance_();
        inParams.ParentPath = originalPath;
        inParams.Path=  destinationPath;
        
        var outParams = this.VHDService.ExecMethod_(method.Name, inParams, null);
        
        if( outParams.ReturnValue  > 4096 ) {
            Print("Fork Disk Failed: result: {0}", outParams.ReturnValue );
            return false;
        }
            
        if( outParams.ReturnValue == 4096 )
            VHD.WaitForJob(outParams.Job.split('=')[1]);  
       
        return true;
    },
    
    Duplicate : function(originalPath, destinationPath) {
        originalPath = Assert.File(FormatArguments(originalPath, arguments));
        destinationPath =  $$.fso.GetAbsolutePathName(FormatArguments(destinationPath, arguments));
    
        var method = this.VHDService.Methods_.Item("ConvertVirtualHardDisk");
        var inParams = method.InParameters.SpawnInstance_();
        inParams.SourcePath = originalPath;
        inParams.DestinationPath =  destinationPath;
        inParams.Type = 3;
        
        var outParams = this.VHDService.ExecMethod_(method.Name, inParams, null);
        
        if( outParams.ReturnValue  > 4096 ) {
            Print("Duplicate Disk Failed: result: {0}", outParams.ReturnValue );
            return false;
        }
            
        if( outParams.ReturnValue == 4096 )
            VHD.WaitForJob(outParams.Job.split('=')[1]);  
       
        return true;
    },
    
    CreateDynamic : function(path, sizeInMegabytes) {
        path = Assert.File(FormatArguments(arguments));
            
        var method = this.VHDService.Methods_.Item("CreateDynamicVirtualHardDisk");
        var inParams = method.InParameters.SpawnInstance_();
        inParams.Path = path;
        inParams.MaxInternalSize =  sizeInMegabytes * 1024*1024;

        var outParams = this.VHDService.ExecMethod_(method.Name, inParams, null);
        
        if( outParams.ReturnValue  > 4096 ) {
            Print("CreateDynamic Disk Failed: result: {0}", outParams.ReturnValue );
            return false;
        }
            
        if( outParams.ReturnValue == 4096 )
            VHD.WaitForJob(outParams.Job.split('=')[1]);  
       
        return true;
    },
    
    CreateFixed : function(path, sizeInMegabytes) {
        path = Assert.File(FormatArguments(arguments));
            
        var method = this.VHDService.Methods_.Item("CreateFixedVirtualHardDisk");
        var inParams = method.InParameters.SpawnInstance_();
        inParams.Path = path;
        inParams.MaxInternalSize =  sizeInMegabytes * 1024*1024;

        var outParams = this.VHDService.ExecMethod_(method.Name, inParams, null);
        
        if( outParams.ReturnValue  > 4096 ) {
            Print("CreateFixed Disk Failed: result: {0}", outParams.ReturnValue );
            return false;
        }
            
        if( outParams.ReturnValue == 4096 )
            VHD.WaitForJob(outParams.Job.split('=')[1]);  
       
        return true;
    },    
    
    Expand : function(path, sizeInMegabytes) {
        path = Assert.File(FormatArguments(arguments));
            
        var method = this.VHDService.Methods_.Item("ExpandVirtualHardDisk");
        var inParams = method.InParameters.SpawnInstance_();
        inParams.Path = path;
        inParams.MaxInternalSize =  sizeInMegabytes * 1024*1024;

        var outParams = this.VHDService.ExecMethod_(method.Name, inParams, null);
        
        if( outParams.ReturnValue  > 4096 ) {
            Print("Expand Disk Failed: result: {0}", outParams.ReturnValue );
            return false;
        }
            
        if( outParams.ReturnValue == 4096 )
            VHD.WaitForJob(outParams.Job.split('=')[1]);  
       
        return true;
            
        VHD.WaitForJob( jobID );  
    },
    
    WaitForJob: function(jobID) {
        var job;
        print (jobID)
        job = this.VirtualizationService.ExecQuery("SELECT * FROM msvm_storagejob where InstanceID = " + jobID) .ItemIndex(0) ;
        
        while(job.JobState < 5 ) {
            job = this.VirtualizationService.ExecQuery("SELECT * FROM msvm_storagejob where InstanceID = " + jobID) .ItemIndex(0);
            Print("Processing..." + job.JobState );
            $$.WScript.Sleep(500);
        }
        Print("Completed.");
    }
};
VHD;

